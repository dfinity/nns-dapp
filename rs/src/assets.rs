use candid::CandidType;
use ic_certified_map::{labeled, Hash, RbTree};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use sha2::{Digest, Sha256};
use std::cell::RefCell;
use std::collections::HashMap;
use std::io::Read;

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
}

pub const LABEL_ASSETS: &[u8] = b"http_assets";
type AssetHashes = RbTree<Vec<u8>, Hash>;

pub struct State {
    pub asset_hashes: RefCell<AssetHashes>,
}

impl Default for State {
    fn default() -> Self {
        Self {
            asset_hashes: RefCell::new(AssetHashes::default()),
        }
    }
}

thread_local! {
    pub static STATE: State = State::default();

    #[allow(clippy::type_complexity)]
    static ASSETS: RefCell<HashMap<String, (Vec<HeaderField>, Vec<u8>)>> = RefCell::new(HashMap::default());
}

pub fn http_request(req: HttpRequest) -> HttpResponse {
    let parts: Vec<&str> = req.url.split('?').collect();
    let request_path = parts[0];

    let certificate_header =
        STATE.with(|s| make_asset_certificate_header(&s.asset_hashes.borrow(), request_path));

    ASSETS.with(|a| match a.borrow().get(request_path) {
        Some((headers, value)) => {
            let mut headers = headers.clone();
            headers.push(certificate_header);

            HttpResponse {
                status_code: 200,
                headers,
                body: ByteBuf::from(value.clone()),
            }
        }
        None => HttpResponse {
            status_code: 404,
            headers: vec![certificate_header],
            body: ByteBuf::from(format!("Asset {} not found.", request_path)),
        },
    })
}

fn make_asset_certificate_header(asset_hashes: &AssetHashes, asset_name: &str) -> (String, String) {
    let certificate = dfn_core::api::data_certificate().unwrap_or_else(|| {
        dfn_core::api::trap_with("data certificate is only available in query calls");
        unreachable!()
    });
    let witness = asset_hashes.witness(asset_name.as_bytes());
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

// used both in init and post_upgrade
pub fn init_assets() {
    STATE.with(|s| {
        let mut asset_hashes = s.asset_hashes.borrow_mut();

        ASSETS.with(|a| {
            let mut assets = a.borrow_mut();

            let compressed = include_bytes!("../../assets.tar.xz").to_vec();
            let mut decompressed = Vec::new();
            lzma_rs::xz_decompress(&mut compressed.as_ref(), &mut decompressed).unwrap();
            let mut tar: tar::Archive<&[u8]> = tar::Archive::new(decompressed.as_ref());
            for entry in tar.entries().unwrap() {
                let mut entry = entry.unwrap();

                let name_bytes = entry
                    .path_bytes()
                    .into_owned()
                    .strip_prefix(b".")
                    .unwrap()
                    .to_vec();

                if !entry.header().entry_type().is_file() {
                    continue;
                }
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

                if name == "/index.html" {
                    let headers = vec![];
                    asset_hashes.insert(b"/".to_vec(), hash_bytes(&bytes));
                    assets.insert("/".to_string(), (headers, bytes.clone()));
                }

                let headers = vec![];
                asset_hashes.insert(name_bytes.clone(), hash_bytes(&bytes));
                assets.insert(name.to_string(), (headers, bytes));
            }
        });
    });
}
