#![allow(clippy::all)]
#![allow(unused_imports)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]

use crate::types::{CandidType, Deserialize, EmptyRecord, Serialize};
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// use candid::{self, CandidType, Deserialize, Serialize, Clone, Debug, candid::Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SnsRootCanister {
    pub dapp_canister_ids: Vec<candid::Principal>,
    pub testflight: bool,
    pub latest_ledger_archive_poll_timestamp_seconds: Option<u64>,
    pub archive_canister_ids: Vec<candid::Principal>,
    pub governance_canister_id: Option<candid::Principal>,
    pub index_canister_id: Option<candid::Principal>,
    pub swap_canister_id: Option<candid::Principal>,
    pub ledger_canister_id: Option<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterIdRecord {
    pub canister_id: candid::Principal,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum CanisterStatusType {
    #[serde(rename = "stopped")]
    Stopped,
    #[serde(rename = "stopping")]
    Stopping,
    #[serde(rename = "running")]
    Running,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DefiniteCanisterSettings {
    pub controllers: Vec<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterStatusResult {
    pub status: CanisterStatusType,
    pub memory_size: candid::Nat,
    pub cycles: candid::Nat,
    pub settings: DefiniteCanisterSettings,
    pub module_hash: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum CanisterInstallMode {
    #[serde(rename = "reinstall")]
    Reinstall,
    #[serde(rename = "upgrade")]
    Upgrade,
    #[serde(rename = "install")]
    Install,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum AuthzChangeOp {
    Authorize { add_self: bool },
    Deauthorize,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MethodAuthzChange {
    pub principal: Option<candid::Principal>,
    pub method_name: String,
    pub canister: candid::Principal,
    pub operation: AuthzChangeOp,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ChangeCanisterProposal {
    pub arg: serde_bytes::ByteBuf,
    pub wasm_module: serde_bytes::ByteBuf,
    pub stop_before_installing: bool,
    pub mode: CanisterInstallMode,
    pub canister_id: candid::Principal,
    pub query_allocation: Option<candid::Nat>,
    pub authz_changes: Vec<MethodAuthzChange>,
    pub memory_allocation: Option<candid::Nat>,
    pub compute_allocation: Option<candid::Nat>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetSnsCanistersSummaryRequest {
    pub update_canister_list: Option<bool>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DefiniteCanisterSettingsArgs {
    pub freezing_threshold: candid::Nat,
    pub controllers: Vec<candid::Principal>,
    pub memory_allocation: candid::Nat,
    pub compute_allocation: candid::Nat,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterStatusResultV2 {
    pub status: CanisterStatusType,
    pub memory_size: candid::Nat,
    pub cycles: candid::Nat,
    pub settings: DefiniteCanisterSettingsArgs,
    pub idle_cycles_burned_per_day: candid::Nat,
    pub module_hash: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterSummary {
    pub status: Option<CanisterStatusResultV2>,
    pub canister_id: Option<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetSnsCanistersSummaryResponse {
    pub root: Option<CanisterSummary>,
    pub swap: Option<CanisterSummary>,
    pub ledger: Option<CanisterSummary>,
    pub index: Option<CanisterSummary>,
    pub governance: Option<CanisterSummary>,
    pub dapps: Vec<CanisterSummary>,
    pub archives: Vec<CanisterSummary>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ListSnsCanistersArg {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug, Default)]
pub struct ListSnsCanistersResponse {
    pub root: Option<candid::Principal>,
    pub swap: Option<candid::Principal>,
    pub ledger: Option<candid::Principal>,
    pub index: Option<candid::Principal>,
    pub governance: Option<candid::Principal>,
    pub dapps: Vec<candid::Principal>,
    pub archives: Vec<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RegisterDappCanisterRequest {
    pub canister_id: Option<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RegisterDappCanisterRet {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RegisterDappCanistersRequest {
    pub canister_ids: Vec<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RegisterDappCanistersRet {}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SetDappControllersRequest {
    pub canister_ids: Option<RegisterDappCanistersRequest>,
    pub controller_principal_ids: Vec<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct CanisterCallError {
    pub code: Option<i32>,
    pub description: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FailedUpdate {
    pub err: Option<CanisterCallError>,
    pub dapp_canister_id: Option<candid::Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SetDappControllersResponse {
    pub failed_updates: Vec<FailedUpdate>,
}

pub struct Service(pub candid::Principal);
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
