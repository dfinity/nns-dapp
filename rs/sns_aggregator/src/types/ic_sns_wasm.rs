//! Rust code created from candid by: `scripts/did2rs.sh --canister sns_wasm --out ic_sns_wasm.rs --header did2rs.header --traits Serialize\,\ Clone\,\ Debug`
//! Candid for canister `sns_wasm` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/release-2024-06-05_23-01-storage-layer-disabled/rs/nns/sns-wasm/canister/sns-wasm.did>
#![allow(clippy::all)]
#![allow(unused_imports)]
#![allow(missing_docs)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]

use crate::types::{CandidType, Deserialize, EmptyRecord, Serialize};
use candid::Principal;
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Deserialize, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ListDeployedSnsesArg {}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize, Default)]
pub struct DeployedSns {
    pub root_canister_id: Option<Principal>,
    pub governance_canister_id: Option<Principal>,
    pub index_canister_id: Option<Principal>,
    pub swap_canister_id: Option<Principal>,
    pub ledger_canister_id: Option<Principal>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ListDeployedSnsesResponse {
    pub instances: Vec<DeployedSns>,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn list_deployed_snses(&self, arg0: ListDeployedSnsesArg) -> CallResult<(ListDeployedSnsesResponse,)> {
        ic_cdk::call(self.0, "list_deployed_snses", (arg0,)).await
    }
}
