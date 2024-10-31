use crate::state::StableState;
use candid::CandidType;
use dfn_candid::Candid;
use on_wire::{FromWire, IntoWire};
use serde::Deserialize;

#[derive(CandidType, Default, Debug, Deserialize, PartialEq)]
pub struct TvlState {
    pub total_locked_icp_e8s: u64,
    pub usd_e8s_per_icp: u64,
    pub exchange_rate_timestamp_seconds: u64,
}

impl StableState for TvlState {
    fn encode(&self) -> Vec<u8> {
        Candid((self,)).into_bytes().unwrap_or_default()
    }

    fn decode(bytes: Vec<u8>) -> Result<Self, String> {
        let (ans,) = Candid::from_bytes(bytes).map(|c| c.0).unwrap_or_default();
        Ok(ans)
    }
}

impl TvlState {
    #[cfg(test)]
    pub fn test_data() -> Self {
        Self {
            total_locked_icp_e8s: 12_345_678_900_000_000,
            usd_e8s_per_icp: 750_000_000,
            exchange_rate_timestamp_seconds: 1_234_567_890,
        }
    }
}
