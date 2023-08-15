//! The state of the canister
use crate::assets::{insert_asset, Asset};
use crate::convert_canister_id;
use crate::fast_scheduler::FastScheduler;
use crate::types::slow::logo_binary;
use crate::types::slow::SlowSnsData;
use crate::types::slow::LOGO_FMT;
use crate::types::upstream::{SnsIndex, UpstreamData};
use crate::types::{CandidType, Deserialize, Serialize};
use crate::{
    assets::{AssetHashes, Assets},
    types::upstream::SnsCache,
};
use anyhow::anyhow;
use ic_cdk::api::management_canister::provisional::CanisterId;
use ic_cdk::api::time;
use ic_cdk_timers::TimerId;
use std::cell::RefCell;
use std::collections::VecDeque;
use std::str::FromStr;

#[cfg(test)]
mod tests;

/// Semi-Persistent state, not guaranteed to be preserved across upgrades but persistent enough to store a cache.
#[derive(Default)]
pub struct State {
    /// Scheduler for getting data from upstream
    pub timer_id: RefCell<Option<TimerId>>,
    /// Scheduler for updating data on SNSs with active swaps
    pub fast_scheduler: RefCell<FastScheduler>,
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
impl State {
    /// Util to get a swap canister ID
    pub fn swap_canister_from_index(&self, index: SnsIndex) -> Result<CanisterId, String> {
        self.stable
            .borrow()
            .sns_cache
            .borrow()
            .all_sns
            .get(index as usize)
            .ok_or_else(|| format!("Requested index '{index}' does not exist"))?
            .1
            .swap_canister_id
            .ok_or_else(|| format!("SNS {index} has no known swap canister"))
    }
    /// Util to get a root canister ID
    pub fn root_canister_from_index(&self, index: SnsIndex) -> Result<CanisterId, String> {
        self.stable
            .borrow()
            .sns_cache
            .borrow()
            .all_sns
            .get(index as usize)
            .ok_or_else(|| format!("Requested index '{index}' does not exist"))?
            .1
            .root_canister_id
            .ok_or_else(|| format!("SNS {index} has no known root canister"))
    }
}

/// State that is saved across canister upgrades.
///
/// Note: Ultimately, the canister state is regenerated automatically, so if state cannot be kept across an upgrade,
///       the state is discarded in favour of upgrading.
#[derive(Default, CandidType, Serialize, Deserialize)]
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
        let mut ser = candid::ser::IDLBuilder::new();
        ser.arg(&self)
            .map_err(|err| format!("Failed to serialize stable state to Candid: {err:?}"))?;
        ser.serialize_to_vec()
            .map_err(|err| format!("Failed to convert stable state serializer to bytes: {err:?}"))
    }
    /// Parse stable state from the format used in stable memory.
    pub fn from_bytes(slice: &[u8]) -> Result<Self, String> {
        let mut de =
            candid::de::IDLDeserialize::new(slice).map_err(|err| format!("Failed to make deserializer: {err:?}"))?;
        de.get_value().map_err(|err| format!("Failed to parse state: {err:?}"))
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

    /// The invariant that the last page is not full has been established.
    ///
    /// Note: Once the invariant is established, it must be maintained by checking whenever the max index is updated.
    pub static LAST_PAGE_NOT_FULL: RefCell<bool> = RefCell::new(false);
}

/// Log to console and store for retrieval by query calls.
pub fn log(message: String) {
    ic_cdk::api::print(&message);
    let now = time();
    let message = format!("{now}: {message}");
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
    /// The prefix for all "v1" assets.
    pub const PREFIX_V1: &'static str = "/v1";

    /// Adds an SNS into the state accessible via certified query calls.
    pub fn insert_sns(index: u64, upstream_data: UpstreamData) -> Result<(), anyhow::Error> {
        Self::insert_sns_v1(index, upstream_data)
    }
    /// Adds pre-signed responses for the API version 1.
    ///
    /// - /sns/index/{index}.json <- All aggregate data about the SNS, in JSON format.
    pub fn insert_sns_v1(index: u64, upstream_data: UpstreamData) -> Result<(), anyhow::Error> {
        let prefix = Self::PREFIX_V1;
        let root_canister_id = convert_canister_id!(upstream_data.canister_ids.root_canister_id);
        let root_canister_str = root_canister_id.to_string();
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
        // Updates the max index, if needed
        {
            STATE.with(|state| {
                if state.stable.borrow().sns_cache.borrow().max_index < index {
                    state.stable.borrow().sns_cache.borrow_mut().max_index = index;
                    Self::ensure_last_page_is_not_full_v1(state);
                }
            });
        }
        // Adds the logo
        {
            let path = format!("{prefix}/sns/root/{root_canister_str}/logo.{LOGO_FMT}");
            let asset = Asset {
                headers: Vec::new(),
                bytes: logo_binary(upstream_data.meta.logo.as_deref().unwrap_or("")),
            };
            insert_asset(path, asset);
        }
        // Adds an http path for just this SNS.
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
        if upstream_data.index + State::PAGE_SIZE
            > STATE.with(|state| state.stable.borrow().sns_cache.borrow().max_index)
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
                serde_json::to_string(&slow_data).map_err(|err| anyhow!("Failed to serialise latest SNSs: {err:?}"))
            })?;
            let asset = Asset {
                headers: Vec::new(),
                bytes: json_data.into_bytes(),
            };
            insert_asset(path, asset);
        }
        // Update the page containing this SNS
        {
            let pagenum = upstream_data.index / State::PAGE_SIZE;
            let path = format!("{prefix}/sns/list/page/{pagenum}/slow.json");
            let asset = STATE.with(|s| {
                let slow_data: Vec<_> = s
                    .stable
                    .borrow()
                    .sns_cache
                    .borrow()
                    .upstream_data
                    .values()
                    .skip((pagenum * State::PAGE_SIZE) as usize)
                    .take(State::PAGE_SIZE as usize)
                    .map(SlowSnsData::from)
                    .collect();
                Self::slow_data_asset_v1(&slow_data)
            });
            insert_asset(path, asset);
        }
        // FIN
        Ok(())
    }

    /// Creates a page of "slow data".
    ///
    /// This shall be used for the the "latest" and paginated responses, so that the response is consistent.
    fn slow_data_asset_v1(slow_data: &[SlowSnsData]) -> Asset {
        let json_data = serde_json::to_string(&slow_data).unwrap_or_default();
        Asset {
            headers: Vec::new(),
            bytes: json_data.into_bytes(),
        }
    }
    /// If the last page is full, create an empty next page.
    fn ensure_last_page_is_not_full_v1(state: &State) {
        let (last_page, entries) = {
            let num_entries = state.stable.borrow().sns_cache.borrow().max_index + 1;
            (num_entries / State::PAGE_SIZE, num_entries % State::PAGE_SIZE)
        };
        if entries == 0 {
            let prefix = Self::PREFIX_V1;
            let path = format!("{prefix}/sns/list/page/{last_page}/slow.json");
            let asset = Self::slow_data_asset_v1(&[]);
            insert_asset(path, asset);
        }
    }

    /// Commands to call on init or post_upgrade.
    pub fn setup() {
        // Establish the invariant that the last page is not full.
        LAST_PAGE_NOT_FULL.with(|not_full| {
            if !*not_full.borrow() {
                STATE.with(Self::ensure_last_page_is_not_full_v1);
                *not_full.borrow_mut() = true;
            }
        });
    }
}

/// Parameters that control the behaviour of the aggregator canister.
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Config {
    /// The update interval, in milliseconds
    pub update_interval_ms: u64,
    /// The fast update interval, in milliseconds
    pub fast_interval_ms: u64,
}
impl Default for Config {
    fn default() -> Self {
        Config {
            update_interval_ms: 120_000,
            fast_interval_ms: 10_000,
        }
    }
}
