use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Default, Debug, Deserialize)]
pub struct TvlState {
    pub total_locked_icp_e8s: u64,
    pub usd_e8s_per_icp: u64,
    pub exchange_rate_timestamp_seconds: u64,
}
