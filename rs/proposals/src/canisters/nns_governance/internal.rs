//! Types from the IC repository `rs/nns/governance/src/governance.rs` exposed externally but not in the `.did` file.
//!
//! Note: These types should probably be published by the upstream in the `.did` file or in some lightweight
//! library.

/// A list of bitcoin networks.
///
/// Note: The type is published in multiple places under the same name:
///  - In the IC repo in `rs/nns/governance/src/governance.rs`
///  - in the `ic_cdk`.
/// The public type is probably better.  Maybe we can ask upstream to use the public type?
pub use ic_cdk::api::management_canister::bitcoin::BitcoinNetwork;

// A proposal payload to set the Bitcoin configuration.
#[derive(candid::CandidType, serde::Serialize, candid::Deserialize, Clone, Debug)]
pub struct BitcoinSetConfigProposal {
    pub network: BitcoinNetwork,
    pub payload: Vec<u8>,
}
