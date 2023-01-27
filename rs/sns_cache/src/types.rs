pub mod ic_sns_governance;
pub mod ic_sns_root;
pub mod ic_sns_wasm;
pub mod ic_sns_swap;
pub mod ic_sns_ledger;

use std::collections::BTreeMap;

use candid::Nat;
use ic_cdk::{
    api::management_canister::provisional::CanisterId,
    export::{
        candid::{CandidType, Deserialize},
        Principal,
    },
};
pub use ic_sns_ledger::{Tokens as SnsTokens, Value as Icrc1Value};
pub use ic_sns_governance::{
    GetMetadataResponse, ListNervousSystemFunctionsResponse,
};
pub use ic_sns_root::ListSnsCanistersResponse;
pub use ic_sns_swap::GetStateResponse;
pub use ic_sns_wasm::{
    DeployedSns, ListDeployedSnsesResponse, SnsCanisterIds,
};
use serde::Serialize;

pub mod slow;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct EmptyRecord{}


#[derive(Clone, Debug, Default, CandidType, Serialize, Deserialize)]
pub struct SnsCache {
    // A list of SNSs that need to be populated in the cache.
    pub sns_to_get: Vec<(SnsIndex, DeployedSns)>,
    // Data obtained about each SNS
    pub upstream_data: BTreeMap<CanisterId, UpstreamData>,
    // Time of last partial update
    pub last_partial_update: u64,
    /// Time of last complete cycle
    pub last_update: u64,
    /// The maximum index provided in a paginated response.
    pub max_index: u64,
}

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

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct CanisterStatusQuery {}

// TODO: Derive from Candid
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct CanisterStatusResultV2 {
    status: CanisterStatusType,
    module_hash: Option<Vec<u8>>,
    controller: candid::Principal,
    settings: DefiniteCanisterSettingsArgs,
    memory_size: candid::Nat,
    cycles: candid::Nat,
    // this is for compat with Spec 0.12/0.13
    balance: Vec<(Vec<u8>, candid::Nat)>,
    freezing_threshold: candid::Nat,
    idle_cycles_burned_per_day: candid::Nat,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, CandidType)]
pub enum CanisterStatusType {
    #[serde(rename = "running")]
    Running,
    #[serde(rename = "stopping")]
    Stopping,
    #[serde(rename = "stopped")]
    Stopped,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct ListSnsCanistersRequest {}

// Struct used for encoding/decoding
/// `(record {
///     controller : principal;
///     compute_allocation: nat;
///     memory_allocation: opt nat;
/// })`
#[derive(Clone, CandidType, Serialize, Deserialize, Debug, Eq, PartialEq)]
pub struct DefiniteCanisterSettingsArgs {
    controller: Principal,
    controllers: Vec<Principal>,
    compute_allocation: candid::Nat,
    memory_allocation: candid::Nat,
    freezing_threshold: candid::Nat,
}
