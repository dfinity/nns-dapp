use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Default, Debug, Deserialize)]
pub struct TvlState {
    pub total_locked_icp_e8s: u64,
}
