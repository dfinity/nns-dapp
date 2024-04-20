//! Rust code created from candid by: scripts/did2rs.sh --canister nns_root --out api.rs --header did2rs.header --traits Serialize
//! Candid for canister `nns_root` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/dd51544944987556c978e774aa7a1992e5c11542/rs/nns/handlers/root/impl/canister/root.did>
#![allow(clippy::all)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult;
use serde::Serialize;

#[derive(Serialize, CandidType, Deserialize)]
pub struct EmptyRecord {}
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, CandidType, Deserialize)]
pub struct CanisterIdRecord {
    pub canister_id: Principal,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum CanisterStatusType {
    #[serde(rename = "stopped")]
    Stopped,
    #[serde(rename = "stopping")]
    Stopping,
    #[serde(rename = "running")]
    Running,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct DefiniteCanisterSettings {
    pub controllers: Vec<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct CanisterStatusResult {
    pub status: CanisterStatusType,
    pub memory_size: candid::Nat,
    pub cycles: candid::Nat,
    pub settings: DefiniteCanisterSettings,
    pub module_hash: Option<serde_bytes::ByteBuf>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ChangeCanisterControllersRequest {
    pub target_canister_id: Principal,
    pub new_controllers: Vec<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ChangeCanisterControllersError {
    pub code: Option<i32>,
    pub description: String,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum ChangeCanisterControllersResult {
    Ok,
    Err(ChangeCanisterControllersError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct ChangeCanisterControllersResponse {
    pub change_canister_controllers_result: ChangeCanisterControllersResult,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn canister_status(&self, arg0: CanisterIdRecord) -> CallResult<(CanisterStatusResult,)> {
        ic_cdk::call(self.0, "canister_status", (arg0,)).await
    }
    pub async fn change_canister_controllers(
        &self,
        arg0: ChangeCanisterControllersRequest,
    ) -> CallResult<(ChangeCanisterControllersResponse,)> {
        ic_cdk::call(self.0, "change_canister_controllers", (arg0,)).await
    }
    pub async fn get_build_metadata(&self) -> CallResult<(String,)> {
        ic_cdk::call(self.0, "get_build_metadata", ()).await
    }
}
