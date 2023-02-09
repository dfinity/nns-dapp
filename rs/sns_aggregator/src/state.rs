//! The state of the canister
use crate::assets::{insert_asset, Asset};
use crate::convert_canister_id;
use crate::types::slow::logo_binary;
use crate::types::slow::SlowSnsData;
use crate::types::slow::LOGO_FMT;
use crate::types::upstream::UpstreamData;
use crate::types::{CandidType, Deserialize, Serialize};
use crate::{
    assets::{AssetHashes, Assets},
    types::upstream::SnsCache,
};
use ic_cdk::api::management_canister::provisional::CanisterId;
use ic_cdk::timer::TimerId;
use std::cell::RefCell;
use std::collections::VecDeque;
use std::str::FromStr;

/// Semi-Persistent state, not guaranteed to be preserved across upgrades but persistent enough to store a cache.
#[derive(Default)]
pub struct State {
    /// Scheduler for getting data from upstream
    pub timer_id: RefCell<Option<TimerId>>,
    /// State perserved across upgrades, as long as the new data structures
    /// are compatible.
    pub stable: RefCell<StableState>,
    /// Hashes for the assets, needed for signing.
    ///
    /// Note: It would be nice to store the asset hashes in stable memory, however RBTree does not support
    /// the required macros for serialization and deserialization.  Instead, we recompute this after upgrade.
    pub asset_hashes: RefCell<AssetHashes>,
    /// Log errors when getting data from upstream
    pub log: RefCell<VecDeque<String>>,
}

/// State that is saved across canister upgrades.
///
/// Note: Ultimately, the canister state is regenerated automatically, so if state cannot be kept across an upgrade,
///       the state is discarded in favour of upgrading.
#[derive(Default, Serialize, Deserialize)]
pub struct StableState {
    /// Configuration that is changed only by deployment, upgrade or similar events.
    pub config: RefCell<Config>,
    /// Data collected about SNSs, dumped as received from upstream.
    pub sns_cache: RefCell<SnsCache>,
    /// Pre-signed data that can be served as high performance certified query calls.
    ///
    /// - /sns/list/latest/slow.json
    /// - /sns/list/0-9/slow.json ... <- Index is used for pagination.  SNSs are arranged in decades.
    /// - /sns/root/${sns_root}/logo.{jpg/png/...}
    /// - /sns/root/${sns_root}/slow.json
    pub assets: RefCell<Assets>,
}

impl StableState {
    /// Serialize stable state in order to store it in stable memory.
    pub fn to_bytes(&self) -> Result<Vec<u8>, String> {
        serde_cbor::to_vec(self).map_err(|err| format!("Failed to serialize stable data: {err:?}"))
    }
    /// Parse stable state from the format used in stable memory.
    pub fn from_bytes(slice: &[u8]) -> Result<Self, String> {
        serde_cbor::from_slice(slice).map_err(|err| format!("Failed to parse stable data: {err:?}"))
    }
    /// Textual description of serialized data.
    pub fn summarize_bytes(bytes: &[u8]) -> String {
        format!(
            "{} bytes starting {:?}",
            bytes.len(),
            &bytes[0..std::cmp::min(7, bytes.len())]
        )
    }
}

thread_local! {
    /// Single global container for state
    pub static STATE: State = State::default();
}

/// Log to console and store for retrieval by query calls.
pub fn log(message: String) {
    ic_cdk::api::print(&message);
    STATE.with(|state| {
        state.log.borrow_mut().push_back(message);
        if state.log.borrow().len() > 200 {
            state.log.borrow_mut().pop_front();
        }
    });
}

impl State {
    /// The maximum number of SNS included in a response.
    ///
    /// Pages are pre-computed to contain indices [0..PAGE_SIZE-1], [PAGE_SIZE..2*PAGE_SIZE-1] and so on.
    ///
    /// Also, the list of most recent SNSs is limited to the page size.
    pub const PAGE_SIZE: u64 = 10;

    /// Adds an SNS into the state accessible via certfied query calls.
    #[deny(clippy::panic)]
#[deny(clippy::expect_used)]
#[deny(clippy::unwrap_used)]
    pub fn insert_sns(index: u64, upstream_data: UpstreamData) -> Result<(), anyhow::Error> {
        Self::insert_sns_v1(index, upstream_data)
    }
    /// Adds pre-signed responses for the API version 1.
    ///
    /// - /sns/index/{index}.json <- All aggregate data about the SNS, in JSON format.
    #[deny(clippy::panic)]
#[deny(clippy::expect_used)]
#[deny(clippy::unwrap_used)]
    pub fn insert_sns_v1(index: u64, upstream_data: UpstreamData) -> Result<(), anyhow::Error> {
        let prefix = "/v1";
        let root_canister_id = convert_canister_id!(upstream_data.canister_ids.root_canister_id);
        let root_canister_str = root_canister_id.to_string();
        // Updates the max index, if needed
        if true
        {
            STATE.with(|state| {
                if state.stable.borrow().sns_cache.borrow().max_index < index {
                    state.stable.borrow().sns_cache.borrow_mut().max_index = index;
                }
            });
        }
                // Add this to the list of values from upstream
                STATE.with(|state| {
                    state
                        .stable
                        .borrow()
                        .sns_cache
                        .borrow_mut()
                        .upstream_data
                        .insert(root_canister_id, upstream_data.clone());
                });
        // Adds the logo
        if true
        {
            let path = format!("{prefix}/sns/root/{root_canister_str}/logo.{LOGO_FMT}");
            let asset = Asset {
                headers: Vec::new(),
                bytes: logo_binary(upstream_data.meta.logo.as_ref().map(|s| s.as_str()).unwrap_or("")),
            };
            insert_asset(path, asset);
        }
        // Adds an http path for just this SNS.
        if true
        {
            let slow_data = SlowSnsData::from(&upstream_data);
            let json_data = serde_json::to_string(&slow_data)?;
            let path = format!("{prefix}/sns/root/{root_canister_str}/slow.json");
            let asset = Asset {
                headers: Vec::new(),
                bytes: json_data.into_bytes(),
            };
            insert_asset(path, asset);
        }

        // If this is in the last N, update latest.
        if true && (upstream_data.index + State::PAGE_SIZE
            > STATE.with(|state| state.stable.borrow().sns_cache.borrow().max_index))
        {
            let path = format!("{prefix}/sns/list/latest/slow.json");
            let json_data = STATE.with(|s| {
                let slow_data: Vec<_> = s
                    .stable
                    .borrow()
                    .sns_cache
                    .borrow()
                    .upstream_data
                    .values()
                    .rev()
                    .take(State::PAGE_SIZE as usize)
                    .map(SlowSnsData::from)
                    .collect();
                serde_json::to_string(&slow_data).unwrap_or_default()
            });
            let asset = Asset {
                headers: Vec::new(),
                bytes: json_data.into_bytes(),
            };
            insert_asset(path, asset);
        }
        Ok(())
    }
}

/// Parameters that control the behaviour of the aggregator canister.
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Config {
    /// The update interval, in milliseconds
    pub update_interval_ms: u64,
}
impl Default for Config {
    fn default() -> Self {
        Config {
            update_interval_ms: 120_000,
        }
    }
}
