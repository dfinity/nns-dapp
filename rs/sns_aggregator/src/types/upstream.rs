//!
use super::ic_sns_governance::{GetMetadataResponse, ListNervousSystemFunctionsResponse};
use super::ic_sns_ledger::Value as Icrc1Value;
use super::ic_sns_root::ListSnsCanistersResponse;
use super::ic_sns_swap::GetStateResponse;
use super::ic_sns_wasm::DeployedSns;
use super::{CandidType, Deserialize};
use ic_cdk::api::management_canister::provisional::CanisterId;
use std::collections::BTreeMap;

use candid::Nat;
use serde::Serialize;

/// Data retrieved from upstream and stored as is, without aggregation or processing.
#[derive(Clone, Debug, Default, CandidType, Serialize, Deserialize)]
pub struct SnsCache {
    /// A list of SNSs that need to be populated in the cache.
    pub sns_to_get: Vec<(SnsIndex, DeployedSns)>,
    /// TODO: Delete.  This field is included for debugging purposes only.
    pub all_sns: Vec<(SnsIndex, DeployedSns)>,
    /// Data obtained about each SNS
    pub upstream_data: BTreeMap<CanisterId, UpstreamData>,
    /// Time of last partial update
    pub last_partial_update: u64,
    /// Time of last complete cycle
    pub last_update: u64,
    /// The maximum index provided in a paginated response.
    pub max_index: u64,
}

/// The index of an SNS in the list provided by the nns-sns-wasm canister.
pub type SnsIndex = u64;

/// Information about an SNS that changes relatively slowly and that is common, i.e. not user specific.
#[derive(Clone, Debug, Default, CandidType, Serialize, Deserialize)]
pub struct UpstreamData {
    /// Index of the SNS in the SNS wasms canister
    pub index: u64,
    /// Canister IDs from the nns-sns-wasm canister.
    pub canister_ids: DeployedSns,
    /// Canister IDs from the sns-root canister.
    pub list_sns_canisters: ListSnsCanistersResponse,
    /// Governance metadata such as token name and logo.
    pub meta: GetMetadataResponse,
    /// Governance parameters such as tokenomics.
    pub parameters: ListNervousSystemFunctionsResponse,
    /// Decentralisation state
    pub swap_state: GetStateResponse,
    /// Ledger metadata.  The ledger keeps track of who owns how many tokens.
    pub icrc1_metadata: Vec<(String, Icrc1Value)>,
    /// The ledger fee, presumably a transaction fee.
    pub icrc1_fee: Nat,
}
