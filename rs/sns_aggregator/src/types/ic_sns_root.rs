//! Rust code created from candid by: scripts/did2rs.sh --canister sns_root --out ic_sns_root.rs --header did2rs.header --traits Serialize\,\ Clone\,\ Debug
//! Candid for canister `sns_root` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/release-2023-10-25_23-01/rs/sns/root/canister/root.did>
#![allow(clippy::all)]
#![allow(unused_imports)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]

use crate::types::{CandidType, Deserialize, EmptyRecord, Serialize};
use candid::Principal;
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct SnsRootCanister {
    pub dapp_canister_ids: Vec<Principal>,
    pub testflight: bool,
    pub latest_ledger_archive_poll_timestamp_seconds: Option<u64>,
    pub archive_canister_ids: Vec<Principal>,
    pub governance_canister_id: Option<Principal>,
    pub index_canister_id: Option<Principal>,
    pub swap_canister_id: Option<Principal>,
    pub ledger_canister_id: Option<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct CanisterIdRecord {
    pub canister_id: Principal,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum CanisterStatusType {
    #[serde(rename = "stopped")]
    Stopped,
    #[serde(rename = "stopping")]
    Stopping,
    #[serde(rename = "running")]
    Running,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DefiniteCanisterSettings {
    pub controllers: Vec<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct CanisterStatusResult {
    pub status: CanisterStatusType,
    pub memory_size: candid::Nat,
    pub cycles: candid::Nat,
    pub settings: DefiniteCanisterSettings,
    pub module_hash: Option<serde_bytes::ByteBuf>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum CanisterInstallMode {
    #[serde(rename = "reinstall")]
    Reinstall,
    #[serde(rename = "upgrade")]
    Upgrade,
    #[serde(rename = "install")]
    Install,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum AuthzChangeOp {
    Authorize { add_self: bool },
    Deauthorize,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct MethodAuthzChange {
    pub principal: Option<Principal>,
    pub method_name: String,
    pub canister: Principal,
    pub operation: AuthzChangeOp,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ChangeCanisterProposal {
    pub arg: serde_bytes::ByteBuf,
    pub wasm_module: serde_bytes::ByteBuf,
    pub stop_before_installing: bool,
    pub mode: CanisterInstallMode,
    pub canister_id: Principal,
    pub query_allocation: Option<candid::Nat>,
    pub authz_changes: Vec<MethodAuthzChange>,
    pub memory_allocation: Option<candid::Nat>,
    pub compute_allocation: Option<candid::Nat>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetSnsCanistersSummaryRequest {
    pub update_canister_list: Option<bool>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DefiniteCanisterSettingsArgs {
    pub freezing_threshold: candid::Nat,
    pub controllers: Vec<Principal>,
    pub memory_allocation: candid::Nat,
    pub compute_allocation: candid::Nat,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct CanisterStatusResultV2 {
    pub status: CanisterStatusType,
    pub memory_size: candid::Nat,
    pub cycles: candid::Nat,
    pub settings: DefiniteCanisterSettingsArgs,
    pub idle_cycles_burned_per_day: candid::Nat,
    pub module_hash: Option<serde_bytes::ByteBuf>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct CanisterSummary {
    pub status: Option<CanisterStatusResultV2>,
    pub canister_id: Option<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetSnsCanistersSummaryResponse {
    pub root: Option<CanisterSummary>,
    pub swap: Option<CanisterSummary>,
    pub ledger: Option<CanisterSummary>,
    pub index: Option<CanisterSummary>,
    pub governance: Option<CanisterSummary>,
    pub dapps: Vec<CanisterSummary>,
    pub archives: Vec<CanisterSummary>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ListSnsCanistersArg {}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize, Default)]
pub struct ListSnsCanistersResponse {
    pub root: Option<Principal>,
    pub swap: Option<Principal>,
    pub ledger: Option<Principal>,
    pub index: Option<Principal>,
    pub governance: Option<Principal>,
    pub dapps: Vec<Principal>,
    pub archives: Vec<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct RegisterDappCanisterRequest {
    pub canister_id: Option<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct RegisterDappCanisterRet {}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct RegisterDappCanistersRequest {
    pub canister_ids: Vec<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct RegisterDappCanistersRet {}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct SetDappControllersRequest {
    pub canister_ids: Option<RegisterDappCanistersRequest>,
    pub controller_principal_ids: Vec<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct CanisterCallError {
    pub code: Option<i32>,
    pub description: String,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct FailedUpdate {
    pub err: Option<CanisterCallError>,
    pub dapp_canister_id: Option<Principal>,
}

#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct SetDappControllersResponse {
    pub failed_updates: Vec<FailedUpdate>,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn canister_status(&self, arg0: CanisterIdRecord) -> CallResult<(CanisterStatusResult,)> {
        ic_cdk::call(self.0, "canister_status", (arg0,)).await
    }
    pub async fn change_canister(&self, arg0: ChangeCanisterProposal) -> CallResult<()> {
        ic_cdk::call(self.0, "change_canister", (arg0,)).await
    }
    pub async fn get_build_metadata(&self) -> CallResult<(String,)> {
        ic_cdk::call(self.0, "get_build_metadata", ()).await
    }
    pub async fn get_sns_canisters_summary(
        &self,
        arg0: GetSnsCanistersSummaryRequest,
    ) -> CallResult<(GetSnsCanistersSummaryResponse,)> {
        ic_cdk::call(self.0, "get_sns_canisters_summary", (arg0,)).await
    }
    pub async fn list_sns_canisters(&self, arg0: ListSnsCanistersArg) -> CallResult<(ListSnsCanistersResponse,)> {
        ic_cdk::call(self.0, "list_sns_canisters", (arg0,)).await
    }
    pub async fn register_dapp_canister(
        &self,
        arg0: RegisterDappCanisterRequest,
    ) -> CallResult<(RegisterDappCanisterRet,)> {
        ic_cdk::call(self.0, "register_dapp_canister", (arg0,)).await
    }
    pub async fn register_dapp_canisters(
        &self,
        arg0: RegisterDappCanistersRequest,
    ) -> CallResult<(RegisterDappCanistersRet,)> {
        ic_cdk::call(self.0, "register_dapp_canisters", (arg0,)).await
    }
    pub async fn set_dapp_controllers(
        &self,
        arg0: SetDappControllersRequest,
    ) -> CallResult<(SetDappControllersResponse,)> {
        ic_cdk::call(self.0, "set_dapp_controllers", (arg0,)).await
    }
}
