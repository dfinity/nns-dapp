//! Machinery for pre-computing assets and serving them as certified HTTP responses.
use crate::state::STATE;
use candid::CandidType;
use ic_certified_map::{labeled, labeled_hash, AsHashTree, Hash, RbTree};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use sha2::{Digest, Sha256};
use std::collections::HashMap;

/// A standard HTTP header
type HeaderField = (String, String);

/// The standardised data structure for HTTP responses as supported natively by the replica.
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpRequest {
    /// The HTTP method of the request, such as "GET" or "POST".
    pub method: String,
    /// The requested path and query string, for example "/some/path?foo=bar".
    ///
    /// Note: This does NOT contain the domain, port or protocol.
    pub url: String,
    /// The HTTP request headers
    pub headers: Vec<(String, String)>,
    /// The complete body of the HTTP request
    pub body: ByteBuf,
}

/// The standardised data structure for HTTP responses as supported natively by the replica.
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct HttpResponse {
    /// The HTTP status code.  E.g. 200 for succcess, 4xx for "you did something wrong", 5xx for "we broke".
    pub status_code: u16,
    /// The headers of the HTTP response
    pub headers: Vec<HeaderField>,
    /// The body of the HTTP response
    pub body: ByteBuf,
}

impl From<String> for HttpResponse {
    fn from(string: String) -> Self {
        HttpResponse {
            status_code: 200,
            headers: Vec::new(),
            body: ByteBuf::from(string.as_bytes()),
        }
    }
}

/// The domain separator used to distinguish HTTP asset hashes from others.
const LABEL_ASSETS: &[u8] = b"http_assets";

/// A tree containing the hashes of all the assets; used for certification.
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
#[derive(CandidType, Clone, Serialize, Deserialize, PartialEq, Eq, Debug)]
pub struct Asset {
    /// HTTP headers to be served with this asset.
    ///
    /// Note: This is typically used for headers that are fairly specific to this asset.
    ///       Headers that are common, such as certification headers or mime type headers
    ///       that can be derived from the path are typically added dynamically.
    pub headers: Vec<HeaderField>,
    /// The HTTP body when this asset is served.
    pub bytes: Vec<u8>,
}

impl Asset {
    /// Creates a new asset with the given bytes in the HTTP body.
    pub fn new(bytes: Vec<u8>) -> Self {
        Self { headers: vec![], bytes }
    }
    /// Adds the given header to the given asset.
    pub fn with_header<S: Into<String>>(mut self, key: S, val: S) -> Self {
        self.headers.push((key.into(), val.into()));
        self
    }
}

/// A database of assets indexed by the path to the actual file, e.g.
/// `/index.html` is a key but `/` is not, although getting the latter
/// will also return the former.
#[derive(Default, CandidType, Serialize, Deserialize, PartialEq, Eq, Debug)]
pub struct Assets(HashMap<String, Asset>);
impl Assets {
    /// Gets the number of assets
    pub fn len(&self) -> usize {
        self.0.len()
    }

    /// Determines whether the assets are empty
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    /// Adds an asset to the assets database.
    pub fn insert<S: Into<String>>(&mut self, path: S, asset: Asset) {
        self.0.insert(path.into(), asset);
    }

    /// Gets an asset, using the actual asset path, e.g.
    /// `/foo/index.html` not `/foo/`.
    pub fn get(&self, path: &str) -> Option<&Asset> {
        self.0.get(path)
    }
}

/// The mime type of an asset, based on the path suffix.
fn content_type_of(request_path: &str) -> Option<&'static str> {
    if request_path.ends_with('/') {
        return Some("text/html");
    }
    request_path.split('.').last().and_then(|suffix| match suffix {
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
    vec![
        ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
        ("X-Frame-Options".to_string(), "DENY".to_string()),
        ("X-Content-Type-Options".to_string(), "nosniff".to_string()),
        (
            "Strict-Transport-Security".to_string(),
            "max-age=31536000 ; includeSubDomains".to_string(),
        ),
        // "Referrer-Policy: no-referrer" would be more strict, but breaks local dev deployment
        // same-origin is still ok from a security perspective
        ("Referrer-Policy".to_string(), "same-origin".to_string()),
    ]
}

/// Generates a header used by clients to verify the integrity of the data.
fn make_asset_certificate_header(asset_hashes: &AssetHashes, asset_name: &str) -> Result<(String, String), String> {
    let certificate = ic_cdk::api::data_certificate()
        .ok_or_else(|| "data certificate is only available in query calls".to_string())?;
    let witness = asset_hashes.0.witness(asset_name.as_bytes());
    let tree = labeled(LABEL_ASSETS, witness);
    let mut serializer = serde_cbor::ser::Serializer::new(vec![]);
    serializer
        .self_describe()
        .map_err(|err| format!("failed to provide the CBOR schema: {err}"))?;
    tree.serialize(&mut serializer)
        .map_err(|err| format!("failed to serialize a hash tree: {err}"))?;
    Ok((
        "IC-Certificate".to_string(),
        format!(
            "certificate=:{}:, tree=:{}:",
            base64::encode(certificate),
            base64::encode(serializer.into_inner())
        ),
    ))
}

/// Computes the sha256 of some given bytes.
pub fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

/// Insert an asset into the state.
pub fn insert_asset<S: Into<String> + Clone>(path: S, asset: Asset) {
    crate::state::log(format!("Inserting asset {}", &path.clone().into()));
    STATE.with(|s| {
        let mut asset_hashes = s.asset_hashes.borrow_mut();
        let stable_memory = s.stable.borrow();
        let mut assets = stable_memory.assets.borrow_mut();
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

/// System call to certify the root hash.
fn update_root_hash(a: &AssetHashes) {
    let prefixed_root_hash = &labeled_hash(LABEL_ASSETS, &a.0.root_hash());
    ic_cdk::api::set_certified_data(&prefixed_root_hash[..]);
}

/// Responds to an HTTP request for an asset.
#[allow(clippy::expect_used)] // This is a query call, so panicking may be correct.
pub fn http_request(req: HttpRequest) -> HttpResponse {
    let mut parts = req.url.splitn(2, '?');
    let request_path = parts.next().unwrap_or("/");
    STATE.with(|state| {
        let mut headers = security_headers();
        let certificate_header =
            make_asset_certificate_header(&state.asset_hashes.borrow(), request_path).expect("Failed to get header");
        headers.push(certificate_header);

        match state.stable.borrow().assets.borrow().get(request_path) {
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

/// Inserts a favicon into the certified assets, if there is not one already.
///
/// Note: If a browser visits the aggregation canister directy, it will request
///       a favicon.  As there is none, the asset canister will return an error
///       and the error also has no certification header, so for two reasons the
///       users will see errors in their console.  While these errors are not an
///       issue in production, they may be misleading at best and may hide real
///       errors when developers examine the canister.
pub fn insert_favicon() {
    STATE.with(|state| {
        // Ensure that there is a favicon, or else we get log spam about bad requests.
        {
            let favicon_path = "/favicon.ico";
            if state.stable.borrow().assets.borrow().get(favicon_path).is_none() {
                let asset = Asset {
                    headers: Vec::new(),
                    bytes: include_bytes!("favicon.ico").to_vec(),
                };
                insert_asset(favicon_path, asset);
            }
        }
    });
}

/// Insert a home page into the certified assets.
pub fn insert_home_page() {
    STATE.with(|state| {
        let path = "/index.html";
        let asset = Asset {
            headers: Vec::new(),
            bytes: include_bytes!("index.html").to_vec(),
        };
        insert_asset(path, asset);
    });
}
