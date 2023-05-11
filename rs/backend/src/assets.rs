use crate::arguments::{TemplateEngine, CANISTER_ARGUMENTS};
use crate::metrics_encoder::MetricsEncoder;
use crate::state::{State, STATE};
use crate::stats::encode_metrics;
use crate::StableState;
use candid::{CandidType, Decode, Encode};
use dfn_core::api::ic0::time;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use ic_certified_map::{labeled, labeled_hash, AsHashTree, Hash, RbTree};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::io::prelude::*;
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

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum ContentEncoding {
    Identity,
    GZip,
}
impl ContentEncoding {
    /// Returns the file suffix for every encoding.
    pub fn suffix(&self) -> &'static str {
        match self {
            ContentEncoding::Identity => "",
            ContentEncoding::GZip => ".gz",
        }
    }
    /// Returns the content encoding, as used in an HTTP header, if applicable.
    pub fn header(&self) -> Option<&'static str> {
        match self {
            ContentEncoding::Identity => None,
            ContentEncoding::GZip => Some("gzip"),
        }
    }
}

const LABEL_ASSETS: &[u8] = b"http_assets";

#[derive(Default, Debug, Eq, PartialEq)]
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

#[derive(Default, CandidType, Deserialize, PartialEq, Eq, Debug)]
pub struct Assets(HashMap<String, Asset>);

impl Assets {
    /// List of content encodings supported by the assets database.
    const CONTENT_ENCODINGS: [ContentEncoding; 2] = [ContentEncoding::GZip, ContentEncoding::Identity];
    /// List of suffix changes that may be made.
    ///
    /// - "" -> "" A path may be served unchanged.
    /// - "/" -> "/index.html" Given the path to a directory, e.g, `/launchpad/`, the index for that
    ///   directory may be returned, e.g. `/launchpad/index.html`
    /// - "" -> "/index.html" A directory does not need a trailing slash.  E.g. `/launchpad` may
    ///   serve `/launchpad/index.html`.  Please note that if this is done, relative URLs in
    ///   index.html will break so be careful if using this much requested but error-prone option.
    const SUFFIX_REWRITES: [(&str, &str); 3] = [("", ""), ("/", "/index.html"), ("", "/index.html")];
    /// Inserts an asset into the database.
    ///
    /// - The asset encoding is deduced from the asset path suffix.  Thus
    ///   e.g. foo.js.gz should be entered with the .gz suffix.
    pub fn insert<S: Into<String>>(&mut self, path: S, asset: Asset) {
        self.0.insert(path.into(), asset);
    }
    /// Gets a given URL path from the assets, if available.
    ///
    /// - If the path looks like an index, the canonical suffix "/index.html" will be used.
    /// - The retrieval search will look for compressed versions of the data.  E.g. if
    ///   foo.json is requested and foo.json.gz is available, that will be returned along with
    ///   "gzip" as the encoding.  The encoding can be set in the browser response HTTP header
    ///   so that the browser will decompress the data before giving it to the requestor.  If
    ///   the requestor wishes to receive the compressed data, without transparent decoding,
    ///   the requestor should ask for "foo.json.gz" instead of "foo.json".
    /// - The current asset signature scheme supports only one signature per path, so we cannot
    ///   take browser capabilities into account.
    pub fn get(&self, path: &str) -> Option<(ContentEncoding, &Asset)> {
        // Note: The logic for finding an asset is the reverse of listing all asset paths.
        for (old_suffix, new_suffix) in Self::SUFFIX_REWRITES {
            if let Some(root) = path.strip_suffix(old_suffix) {
                let new_path = root.to_string() + new_suffix;
                if let Some(asset_with_encoding) = Self::CONTENT_ENCODINGS.iter().find_map(|content_encoding| {
                    self.get_with_encoding(*content_encoding, &new_path)
                        .map(|asset| (*content_encoding, asset))
                }) {
                    return Some(asset_with_encoding);
                }
            }
        }
        None
    }
    /// Gets the given URL path from the assets, with the given encoding.
    fn get_with_encoding(&self, content_encoding: ContentEncoding, path: &str) -> Option<&Asset> {
        let path_with_suffix = {
            let mut extended = String::new();
            extended.push_str(path);
            extended.push_str(content_encoding.suffix());
            extended
        };
        self.0.get(&path_with_suffix)
    }

    /// Returns the paths for which a given asset may be returned.
    /// Note:  All these paths must be certified.
    pub fn alternate_paths(path: &str) -> Vec<String> {
        // path.gz may be obtained as path.  Likewise for all encodings.
        Self::CONTENT_ENCODINGS
            .iter()
            .filter_map(|content_encoding| {
                if path.ends_with(content_encoding.suffix()) {
                    Some(path[0..path.len() - content_encoding.suffix().len()].to_string())
                } else {
                    None
                }
            })
            // Add the directory, with trailing slash, as an alternative path.
            // Note: Without the trailing slash the location of "." is the parent, so breaks resource links.
            .flat_map(|path| {
                Self::SUFFIX_REWRITES
                    .iter()
                    .filter_map(|(new_suffix, original_suffix)| {
                        path.strip_suffix(original_suffix)
                            .map(|root| root.to_string() + new_suffix)
                    })
                    .collect::<Vec<String>>()
            })
            .collect()
    }
}

pub fn http_request(req: HttpRequest) -> HttpResponse {
    let parts: Vec<&str> = req.url.split('?').collect();
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
                            ("Content-Type".to_string(), "text/plain; version=0.0.4".to_string()),
                            ("Content-Length".to_string(), body.len().to_string()),
                        ],
                        body: ByteBuf::from(body),
                    }
                }
                Err(err) => HttpResponse {
                    status_code: 500,
                    headers: vec![],
                    body: ByteBuf::from(format!("Failed to encode metrics: {}", err)),
                },
            }
        }
        request_path => STATE.with(|s| {
            let mut headers = security_headers();
            let certificate_header = make_asset_certificate_header(&s.asset_hashes.borrow(), request_path);
            headers.push(certificate_header);

            match s.assets.borrow().get(request_path) {
                Some((content_encoding, asset)) => {
                    headers.extend(asset.headers.clone());
                    if let Some(content_type) = content_type_of(request_path) {
                        headers.push(("Content-Type".to_string(), content_type.to_string()));
                    }
                    if let Some(content_encoding_header) = content_encoding.header() {
                        headers.push(("Content-Encoding".to_string(), content_encoding_header.to_string()));
                    }
                    // Assets within .well-known are used by II and should be accessible
                    if request_path.starts_with("/.well-known") {
                        headers.push(("Access-Control-Allow-Origin".to_string(), "*".to_string()));
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
        }),
    }
}

fn content_type_of(request_path: &str) -> Option<&'static str> {
    if request_path.ends_with('/') {
        return Some("text/html");
    }
    // ii-alternative-origins needs to be set as JSON even though it has no file extension
    // https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/alternative-origins#listing-origins
    if request_path.ends_with("ii-alternative-origins") {
        return Some("application/json");
    }
    // Mentioned here: https://github.com/dfinity/internet-identity/pull/1230
    // If you follow the official docs https://github.com/r-birkner/portal/blob/rjb/custom-domains-docs-v2/docs/developer-docs/production/custom-domain/custom-domain.md#custom-domains-on-the-boundary-nodes
    // The file is set to type octet-stream
    if request_path.ends_with("ic-domains") {
        return Some("application/octet-stream");
    }

    request_path.split('.').last().and_then(|suffix| match suffix {
        "css" => Some("text/css"),
        "html" => Some("text/html"),
        "xml" => Some("application/xml"),
        "js" => Some("application/javascript"),
        "mjs" => Some("application/javascript"),
        "json" => Some("application/json"),
        "svg" => Some("image/svg+xml"),
        "png" => Some("image/png"),
        "jpeg" => Some("image/jpeg"),
        "jpg" => Some("image/jpeg"),
        "ico" => Some("image/x-icon"),
        "ttf" => Some("font/ttf"),
        "woff2" => Some("font/woff2"),
        "txt" => Some("text/plain"),
        path if path == suffix => Some("text/html"), // Path has no suffix.  E.g. /launchpad
        _ => None,                                   // Path has an unrecognised suffix.
    })
}

/// List of recommended security headers as per https://owasp.org/www-project-secure-headers/
/// These headers enable browser security features (like limit access to platform apis and set
/// iFrame policies, etc.).
/// TODO https://dfinity.atlassian.net/browse/L2-185: Add CSP and Permissions-Policy
fn security_headers() -> Vec<HeaderField> {
    vec![
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

fn make_asset_certificate_header(asset_hashes: &AssetHashes, asset_name: &str) -> (String, String) {
    let certificate = dfn_core::api::data_certificate().unwrap_or_else(|| {
        dfn_core::api::trap_with("data certificate is only available in query calls");
        unreachable!()
    });
    let witness = asset_hashes.0.witness(asset_name.as_bytes());
    let tree = labeled(LABEL_ASSETS, witness);
    let mut serializer = serde_cbor::ser::Serializer::new(vec![]);
    serializer.self_describe().unwrap();
    tree.serialize(&mut serializer)
        .unwrap_or_else(|e| dfn_core::api::trap_with(&format!("failed to serialize a hash tree: {}", e)));
    (
        "IC-Certificate".to_string(),
        format!(
            "certificate=:{}:, tree=:{}:",
            base64::encode(certificate),
            base64::encode(serializer.into_inner())
        ),
    )
}

pub fn hash_bytes(value: impl AsRef<[u8]>) -> Hash {
    let mut hasher = Sha256::new();
    hasher.update(value.as_ref());
    hasher.finalize().into()
}

/// Insert an asset into the state and update the certificates.
pub fn insert_asset<S: Into<String> + Clone>(path: S, asset: Asset) {
    STATE.with(|state| {
        insert_asset_into_state(state, path, asset);
        update_root_hash(&state.asset_hashes.borrow_mut());
    });
}
/// Insert an asset into the given state.
///
/// Note:  This does NOT update the certificates.  To insert multiple assets, call
///        this repeatedly and then update the root hash.
pub fn insert_asset_into_state<S: Into<String> + Clone>(state: &State, path: S, asset: Asset) {
    let mut asset_hashes = state.asset_hashes.borrow_mut();
    let mut assets = state.assets.borrow_mut();
    let path: String = path.into();
    let hash = hash_bytes(&asset.bytes);
    for alternate_path in Assets::alternate_paths(&path) {
        asset_hashes.0.insert(alternate_path.as_bytes().to_vec(), hash);
    }
    assets.insert(path, asset);
}

/// Adds the files bundled in the wasm to the state.
///
/// Note: Used both in init and post_upgrade
pub fn init_assets() {
    let compressed = include_bytes!("../../../assets.tar.xz").to_vec();
    insert_tar_xz(&compressed);
}

/// Adds an xz compressed tarball of assets to the state.
///
/// - Adds the files to `state.assets`.
/// - Signs the given path and all alternate paths for the given asset.
pub fn insert_tar_xz(compressed: &[u8]) {
    dfn_core::api::print("Inserting assets...");
    let mut num_assets = 0;
    let mut decompressed = Vec::new();
    lzma_rs::xz_decompress(&mut compressed.as_ref(), &mut decompressed).unwrap();
    let mut tar: tar::Archive<&[u8]> = tar::Archive::new(decompressed.as_ref());
    let arguments_html = CANISTER_ARGUMENTS.with(|args| args.borrow().to_html());
    let template_engine = CANISTER_ARGUMENTS.with(|args| TemplateEngine::new(&args.borrow().args));
    STATE.with(|state| {
        for entry in tar.entries().unwrap() {
            let mut entry = entry.unwrap();

            if !entry.header().entry_type().is_file() {
                continue;
            }

            let name_bytes = entry.path_bytes().into_owned().strip_prefix(b".").unwrap().to_vec();

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

            if name.ends_with("index.html.gz") {
                let mut html = gunzip_string(&bytes);
                if let Some(insertion_point) = html.find("</head>") {
                    html.insert_str(insertion_point, &arguments_html);
                }
                let html = template_engine.populate(&html);
                bytes = gzip(html.as_bytes());
            }

            insert_asset_into_state(state, name, Asset::new(bytes));
            num_assets += 1;
        }
        update_root_hash(&state.asset_hashes.borrow_mut());
    });
    dfn_core::api::print(format!("Inserted {num_assets} assets."));
}

impl StableState for Assets {
    fn encode(&self) -> Vec<u8> {
        // Encode all stable assets.
        let stable_assets: Assets = Assets(self.0.clone().into_iter().filter(|(_, asset)| asset.stable).collect());

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

/// Compress data
pub fn gzip(uncompressed: &[u8]) -> Vec<u8> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(uncompressed).unwrap_or_default();
    encoder.finish().unwrap_or_default()
}
/// Uncompress data
pub fn gunzip_string(compressed: &[u8]) -> String {
    let mut d = GzDecoder::new(compressed);
    let mut s = String::new();
    d.read_to_string(&mut s).unwrap_or_default();
    s
}
