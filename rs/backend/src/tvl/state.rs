use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Default, Debug, Deserialize)]
pub struct TvlState {
    pub total_locked_icp_e8s: u64,
    pub usd_per_icp_e8s: u64,
    pub exchange_rate_timestamp_sec: u64,
}
