///! Types from rs/nns/governance/src/governance.rs exposed externally but not in the .did file.

/// Note: There is a synonymous type in rs/nns/governance/src/governance.rs but maybe the public type is better?
/// Maybe we can ask upstream to use the public type?
pub use ic_cdk::api::management_canister::bitcoin::BitcoinNetwork;

// A proposal payload to set the Bitcoin configuration.
#[derive(candid::CandidType, serde::Serialize, candid::Deserialize, Clone, Debug)]
pub struct BitcoinSetConfigProposal {
    pub network: BitcoinNetwork,
    pub payload: Vec<u8>,
}