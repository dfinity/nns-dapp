use crate::state::STATE;
use crate::StableState;
use candid::{CandidType, Decode, Encode};
use ic_certified_map::{labeled, labeled_hash, AsHashTree, Hash, RbTree};
use serde::{Deserialize, Serialize};
use serde_bytes::{ByteBuf};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::io::Read;

use crate::metrics_encoder::MetricsEncoder;
use dfn_core::api::ic0::time;

type HeaderField = (String, String);

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpRequest {
    method: String,
    url: String,
    headers: Vec<(String, String)>,
    body: ByteBuf,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpResponse {
    status_code: u16,
    headers: Vec<HeaderField>,
    body: ByteBuf,
    // body: Cow<'static, Bytes>,
}

const LABEL_ASSETS: &[u8] = b"http_assets";

#[derive(Default)]
pub struct AssetHashes(RbTree<Vec<u8>, Hash>);

impl From<&Assets> for AssetHashes {
    fn from(assets: &Assets) -> Self {
        let mut asset_hashes = Self::default();
        for (path, asset) in assets.0.iter() {
            asset_hashes.0.insert(path.as_bytes().to_vec(), hash_bytes(&asset.bytes));
        }
        asset_hashes
    }
}

/// An asset to be served via HTTP requests.
#[derive(CandidType, Clone, Deserialize, PartialEq, Debug)]
pub struct Asset {
    headers: Vec<HeaderField>,
    bytes: Vec<u8>,
    // Whether the asset is persisted across upgrades.
    stable: bool,
}

impl Asset {
    pub fn new(bytes: Vec<u8>) -> Self {
        Self {
            headers: vec![],
            bytes,
            stable: false,
        }
    }

    pub fn new_stable(bytes: Vec<u8>) -> Self {
        Self {
            headers: vec![],
            bytes,
            stable: true,
        }
    }

    pub fn with_header<S: Into<String>>(mut self, key: S, val: S) -> Self {
        self.headers.push((key.into(), val.into()));
        self
    }
}

#[derive(Default, CandidType, Deserialize, PartialEq, Debug)]
pub struct Assets(HashMap<String, Asset>);

impl Assets {
    fn insert<S: Into<String>>(&mut self, path: S, asset: Asset) {
        self.0.insert(path.into(), asset);
    }

    fn get(&self, path: &str) -> Option<&Asset> {
        self.0.get(path)
    }
}


fn encode_metrics(w: &mut MetricsEncoder<Vec<u8>>) -> std::io::Result<()> {
    STATE.with(|s| {
        let stats = s.accounts_store.borrow().get_stats(); 
        w.encode_gauge(
            "neurons_created_count",
            stats.neurons_created_count as f64,
            "Number of neurons created.",
        )?;
        w.encode_gauge(
            "neurons_topped_up_count",
            stats.neurons_topped_up_count as f64,
            "Number of neurons topped up by the canister.",
        )?;
        w.encode_gauge(
            "transactions_count",
            stats.transactions_count as f64,
            "Number of transactions processed by the canister.",
        )?;
        w.encode_gauge(
            "accounts_count",
            stats.accounts_count as f64,
            "Number of accounts created.",
        )?;
        w.encode_gauge(
            "sub_accounts_count",
            stats.sub_accounts_count as f64,
            "Number of sub accounts created.",
        )?;
        Ok(())
    })
}




pub fn http_request(req: HttpRequest) -> HttpResponse {
    let parts: Vec<&str>   = req.url.split('?').collect();
    match parts[0] {
        "/metrics" => {
            let now;
            unsafe {
                now = time();
            };
            let mut writer = MetricsEncoder::new(vec![], now / 1_000_000);
            match encode_metrics(&mut writer) {
                Ok(()) => {
                    let body = writer.into_inner();
                    HttpResponse {
                        status_code: 200,
                        headers: vec![
                            (
                                "Content-Type".to_string(),
                                "text/plain; version=0.0.4".to_string(),
                            ),
                            ("Content-Length".to_string(), body.len().to_string()),
                        ],
                        body: ByteBuf::from(body),    
                        // body: Cow::Owned(ByteBuf::from(body)),
                    }
                }
                Err(err) => HttpResponse {
                    status_code: 500,
                    headers: vec![],
                    body: ByteBuf::from(format!("Failed to encode metrics: {}", err)),
                    // body: Cow::Owned(ByteBuf::from(format!("Failed to encode metrics: {}", err))),
                },
            }
        }
        request_path => {
                STATE.with(|s| {
                let certificate_header =
                    make_asset_certificate_header(&s.asset_hashes.borrow(), request_path);

                match s.assets.borrow().get(request_path) {
                    Some(asset) => {
                        let mut headers = asset.headers.clone();
                        headers.push(certificate_header);

                        HttpResponse {
                            status_code: 200,
                            headers,
                            body: ByteBuf::from(asset.bytes.clone()),
                            // body: Cow::Owned(ByteBuf::from(asset.bytes.clone())),
                        }
                    }
                    None => HttpResponse {
                        status_code: 404,
                        headers: vec![certificate_header],
                        body: ByteBuf::from(format!("Asset {} not found.", request_path)),
                        // body: Cow::Owned(ByteBuf::from(format!("Asset {} not found.", request_path))),
                    },
                }
            })
        }
    }
}

// pub fn http_request(req: HttpRequest) -> HttpResponse {
//     let parts: Vec<&str> = req.url.split('?').collect();
//     let request_path = parts[0];

//     STATE.with(|s| {
//         let certificate_header =
//             make_asset_certificate_header(&s.asset_hashes.borrow(), request_path);

//         match s.assets.borrow().get(request_path) {
//             Some(asset) => {
//                 let mut headers = asset.headers.clone();
//                 headers.push(certificate_header);

//                 HttpResponse {
//                     status_code: 200,
//                     headers,
//                     body: ByteBuf::from(asset.bytes.clone()),
//                 }
//             }
//             None => HttpResponse {
//                 status_code: 404,
//                 headers: vec![certificate_header],
//                 body: ByteBuf::from(format!("Asset {} not found.", request_path)),
//             },
//         }
//     })
// }

fn make_asset_certificate_header(asset_hashes: &AssetHashes, asset_name: &str) -> (String, String) {
    let certificate = dfn_core::api::data_certificate().unwrap_or_else(|| {
        dfn_core::api::trap_with("data certificate is only available in query calls");
        unreachable!()
    });
    let witness = asset_hashes.0.witness(asset_name.as_bytes());
    let tree = labeled(LABEL_ASSETS, witness);
    let mut serializer = serde_cbor::ser::Serializer::new(vec![]);
    serializer.self_describe().unwrap();
    tree.serialize(&mut serializer).unwrap_or_else(|e| {
        dfn_core::api::trap_with(&format!("failed to serialize a hash tree: {}", e))
    });
    (
        "IC-Certificate".to_string(),
        format!(
            "certificate=:{}:, tree=:{}:",
            base64::encode(&certificate),
            base64::encode(&serializer.into_inner())
        ),
    )
}

pub fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

/// Insert an asset into the state.
pub fn insert_asset<S: Into<String> + Clone>(path: S, asset: Asset) {
    dfn_core::api::print(format!("Inserting asset {}", &path.clone().into()));
    STATE.with(|s| {
        let mut asset_hashes = s.asset_hashes.borrow_mut();
        let mut assets = s.assets.borrow_mut();
        let path = path.into();

        if path == "/index.html" {
            asset_hashes.0.insert(b"/".to_vec(), hash_bytes(&asset.bytes));
            assets.insert("/", asset.clone());
        }

        asset_hashes.0.insert(path.as_bytes().to_vec(), hash_bytes(&asset.bytes));
        assets.insert(path, asset);

        update_root_hash(&asset_hashes);
    });
}

// used both in init and post_upgrade
pub fn init_assets() {
    let compressed = include_bytes!("../../assets.tar.xz").to_vec();
    let mut decompressed = Vec::new();
    lzma_rs::xz_decompress(&mut compressed.as_ref(), &mut decompressed).unwrap();
    let mut tar: tar::Archive<&[u8]> = tar::Archive::new(decompressed.as_ref());
    for entry in tar.entries().unwrap() {
        let mut entry = entry.unwrap();

        if !entry.header().entry_type().is_file() {
            continue;
        }

        let name_bytes = entry
            .path_bytes()
            .into_owned()
            .strip_prefix(b".")
            .unwrap()
            .to_vec();

        let name = String::from_utf8(name_bytes.clone()).unwrap_or_else(|e| {
            dfn_core::api::trap_with(&format!(
                "non-utf8 file name {}: {}",
                String::from_utf8_lossy(&name_bytes),
                e
            ));
            unreachable!()
        });

        let mut bytes = Vec::new();
        entry.read_to_end(&mut bytes).unwrap();

        dfn_core::api::print(format!("{}: {}", &name, bytes.len()));

        insert_asset(name, Asset::new(bytes));
    }
}

impl StableState for Assets {
    fn encode(&self) -> Vec<u8> {
        // Encode all stable assets.
        let stable_assets: Assets = Assets(
            self.0
                .clone()
                .into_iter()
                .filter(|(_, asset)| asset.stable)
                .collect(),
        );

        Encode!(&stable_assets).unwrap()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        Decode!(&bytes, Assets).map_err(|err| err.to_string())
    }
}

fn update_root_hash(a: &AssetHashes) {
    let prefixed_root_hash = &labeled_hash(LABEL_ASSETS, &a.0.root_hash());
    dfn_core::api::set_certified_data(&prefixed_root_hash[..]);
}

#[test]
fn encode_decode() {
    // Test that encoding/decoding preserves stable assets.
    use maplit::hashmap;
    let assets = Assets(hashmap! {
        "x".to_string() => Asset::new_stable(vec![1,2,3]),
        "y".to_string() => Asset::new(vec![4,5,6])
    });

    let assets = Assets::decode(assets.encode()).unwrap();

    assert_eq!(
        assets,
        Assets(hashmap! {
            "x".to_string() => Asset::new_stable(vec![1,2,3])
        })
    );
}
