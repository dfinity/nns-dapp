use crate::assets::{insert_asset, Asset};
use crate::convert_canister_id;
use crate::types::slow::logo_binary;
use crate::types::slow::SlowSnsData;
use crate::types::slow::LOGO_FMT;
use crate::types::UpstreamData;
use crate::{
    assets::{AssetHashes, Assets},
    types::SnsCache,
};
use ic_cdk::api::management_canister::provisional::CanisterId;
use std::cell::RefCell;
use std::str::FromStr;

/// Semi-Persistent state, not guaranteed to be preserved across upgrades but persistent enough to store a cache.
#[derive(Default)]
pub struct State {
    /// Data collected about SNSs, dumped as received from upstream.
    pub sns_aggregator: RefCell<SnsCache>,
    /// Pre-signed data that can be served as high performance certified query calls.
    ///
    /// - /sns/list/latest/slow.json
    /// - /sns/list/0-9/slow.json ... <- Index is used for pagination.  SNSs are arranged in decades.
    /// - /sns/root/${sns_root}/logo.{jpg/png/...}
    /// - /sns/root/${sns_root}/slow.json
    pub assets: RefCell<Assets>,
    /// Hashes for the assets, needed for signing.
    pub asset_hashes: RefCell<AssetHashes>,
}

thread_local! {
    /// Single global container for state.
    pub static STATE: State = State::default();
}

impl State {
    /// Adds an SNS into the state accessible via certfied query calls.
    pub fn insert_sns(index: u64, upstream_data: UpstreamData) -> Result<(), anyhow::Error> {
        Self::insert_sns_v1(index, upstream_data)
    }
    /// Adds pre-signed responses for the API version 1.
    ///
    /// - /sns/index/{index}.json <- All aggregate data about the SNS, in JSON format.
    pub fn insert_sns_v1(index: u64, upstream_data: UpstreamData) -> Result<(), anyhow::Error> {
        let prefix = "/v1";
        let root_canister_id = convert_canister_id!(upstream_data.canister_ids.root_canister_id);
        let root_canister_str = root_canister_id.to_string();
        // Updates the max index, if needed
        {
            STATE.with(|state| {
                if state.sns_aggregator.borrow().max_index < index {
                    state.sns_aggregator.borrow_mut().max_index = index;
                }
            });
        }
        // Adds the logo
        {
            let path = format!("{prefix}/sns/root/{root_canister_str}/logo.{LOGO_FMT}");
            let asset = Asset {
                headers: Vec::new(),
                bytes: logo_binary(upstream_data.meta.logo.as_ref().expect("Missing logo")),
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
        const PAGE_SIZE: u64 = 10;
        // If this is in the last N, update latest.
        if upstream_data.index + PAGE_SIZE > STATE.with(|state| state.sns_aggregator.borrow().max_index)
        {
            let path = format!("{prefix}/sns/list/latest/slow.json");
            let json_data = STATE.with(|s| {
                let slow_data: Vec<_> = s
                    .sns_aggregator
                    .borrow()
                    .upstream_data
                    .values()
                    .rev()
                    .take(PAGE_SIZE as usize)
                    .map(SlowSnsData::from)
                    .collect();
                serde_json::to_string(&slow_data).expect("Failed to serialise all SNSs")
            });
            let asset = Asset {
                headers: Vec::new(),
                bytes: json_data.into_bytes(),
            };
            insert_asset(path, asset);
        }
        // Add this to the list of values from upstream
        STATE.with(|state| {
            state
                .sns_aggregator
                .borrow_mut()
                .upstream_data
                .insert(root_canister_id, upstream_data);
        });
        Ok(())
    }
}
