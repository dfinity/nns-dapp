use crate::state::STATE;
use candid::CandidType;
use ic_certified_map::{labeled, labeled_hash, AsHashTree, Hash, RbTree};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use sha2::{Digest, Sha256};
use std::collections::HashMap;

type HeaderField = (String, String);

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<(String, String)>,
    pub body: ByteBuf,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpResponse {
    pub status_code: u16,
    pub headers: Vec<HeaderField>,
    pub body: ByteBuf,
}

const LABEL_ASSETS: &[u8] = b"http_assets";

#[derive(Default)]
pub struct AssetHashes(RbTree<Vec<u8>, Hash>);

impl From<&Assets> for AssetHashes {
    fn from(assets: &Assets) -> Self {
        let mut asset_hashes = Self::default();
        for (path, asset) in assets.0.iter() {
            asset_hashes
                .0
                .insert(path.as_bytes().to_vec(), hash_bytes(&asset.bytes));
        }
        asset_hashes
    }
}

/// An asset to be served via HTTP requests.
#[derive(CandidType, Clone, Deserialize, PartialEq, Eq, Debug)]
pub struct Asset {
    pub headers: Vec<HeaderField>,
    pub bytes: Vec<u8>,
}

impl Asset {
    pub fn new(bytes: Vec<u8>) -> Self {
        Self {
            headers: vec![],
            bytes,
        }
    }

    pub fn new_stable(bytes: Vec<u8>) -> Self {
        Self {
            headers: vec![],
            bytes,
        }
    }

    pub fn with_header<S: Into<String>>(mut self, key: S, val: S) -> Self {
        self.headers.push((key.into(), val.into()));
        self
    }
}

#[derive(Default, CandidType, Deserialize, PartialEq, Eq, Debug)]
pub struct Assets(HashMap<String, Asset>);

impl Assets {
    pub fn insert<S: Into<String>>(&mut self, path: S, asset: Asset) {
        self.0.insert(path.into(), asset);
    }

    pub fn get(&self, path: &str) -> Option<&Asset> {
        self.0.get(path)
    }
}

fn content_type_of(request_path: &str) -> Option<&'static str> {
    if request_path.ends_with('/') {
        return Some("text/html");
    }
    request_path
        .split('.')
        .last()
        .and_then(|suffix| match suffix {
            "css" => Some("text/css"),
            "html" => Some("text/html"),
            "xml" => Some("application/xml"),
            "js" => Some("application/javascript"),
            "json" => Some("application/json"),
            "svg" => Some("image/svg+xml"),
            "png" => Some("image/png"),
            "jpeg" => Some("image/jpeg"),
            "jpg" => Some("image/jpeg"),
            "ico" => Some("image/x-icon"),
            "ttf" => Some("font/ttf"),
            "woff2" => Some("font/woff2"),
            "txt" => Some("text/plain"),
            _ => None,
        })
}

/// List of recommended security headers as per https://owasp.org/www-project-secure-headers/
/// These headers enable browser security features (like limit access to platform apis and set
/// iFrame policies, etc.).
/// TODO https://dfinity.atlassian.net/browse/L2-185: Add CSP and Permissions-Policy
fn security_headers() -> Vec<HeaderField> {
    vec![("Access-Control-Allow-Origin".to_string(), "foo".to_string()),
    ("X-Content-Type-Options".to_string(), "nosniff".to_string()), ("X-Access-Control-Allow-Origin".to_string(), "safsdfhkgasjfd".to_string())]
/*
    ("X-Frame-Options".to_string(), "DENY".to_string()),
        ("X-Content-Type-Options".to_string(), "nosniff".to_string()),
        (
            "Strict-Transport-Security".to_string(),
            "max-age=31536000 ; includeSubDomains".to_string(),
        ),
        // "Referrer-Policy: no-referrer" would be more strict, but breaks local dev deployment
        // same-origin is still ok from a security perspective
        ("Referrer-Policy".to_string(), "same-origin".to_string()),
    ]*/
}

fn make_asset_certificate_header(asset_hashes: &AssetHashes, asset_name: &str) -> (String, String) {
    let certificate = ic_cdk::api::data_certificate().unwrap_or_else(|| {
        panic!("data certificate is only available in query calls");
    });
    let witness = asset_hashes.0.witness(asset_name.as_bytes());
    let tree = labeled(LABEL_ASSETS, witness);
    let mut serializer = serde_cbor::ser::Serializer::new(vec![]);
    serializer.self_describe().unwrap();
    tree.serialize(&mut serializer).unwrap_or_else(|e| {
        panic!("failed to serialize a hash tree: {}", e);
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
    ic_cdk::api::print(format!("Inserting asset {}", &path.clone().into()));
    STATE.with(|s| {
        let mut asset_hashes = s.asset_hashes.borrow_mut();
        let mut assets = s.assets.borrow_mut();
        let path = path.into();

        let index = "index.html";
        if path.split('/').last() == Some(index) {
            // Add the directory, with trailing slash, as an alternative path.
            // Note: Without the trailing slash the location of "." is the parent, so breaks resource links.
            let prefix_len = path.len() - index.len();
            let dirname = &path[..prefix_len];
            asset_hashes
                .0
                .insert(dirname.as_bytes().to_vec(), hash_bytes(&asset.bytes));
            assets.insert(dirname, asset.clone());
        }

        asset_hashes
            .0
            .insert(path.as_bytes().to_vec(), hash_bytes(&asset.bytes));
        assets.insert(path, asset);

        update_root_hash(&asset_hashes);
    });
}

fn update_root_hash(a: &AssetHashes) {
    let prefixed_root_hash = &labeled_hash(LABEL_ASSETS, &a.0.root_hash());
    ic_cdk::api::set_certified_data(&prefixed_root_hash[..]);
}

/// Responds to an HTTP request for an asset.
pub fn http_request(req: HttpRequest) -> HttpResponse {
    let mut parts = req.url.splitn(2, '?');
    let request_path = parts.next().expect("No path");
    STATE.with(|state| {
        let mut headers = security_headers();
        let certificate_header =
            make_asset_certificate_header(&state.asset_hashes.borrow(), request_path);
        headers.push(certificate_header);

        match state.assets.borrow().get(&request_path) {
            Some(asset) => {
                headers.extend(asset.headers.clone());
                if let Some(content_type) = content_type_of(request_path) {
                    headers.push(("Content-Type".to_string(), content_type.to_string()));
                }

                HttpResponse {
                    status_code: 200,
                    headers,
                    body: ByteBuf::from(asset.bytes.clone()),
                }
            }
            None => HttpResponse {
                status_code: 404,
                headers,
                body: ByteBuf::from(format!("Asset {} not found.", request_path)),
            },
        }
    })
}

/// Inserts a favicon into the certifgied assets, if there is not one already.
pub fn insert_favicon() {
    STATE.with(|state| {
        // Ensure that there is a favicon, or else we get log spam about bad requests.
        {
            let favicon_path = "/favicon.ico";
            if state.assets.borrow().get(favicon_path).is_none() {
                let asset = Asset {
                    headers: Vec::new(),
                    bytes: include_bytes!("favicon.ico").to_vec(),
                };
                insert_asset(favicon_path, asset);
            }
        }
    });
}
