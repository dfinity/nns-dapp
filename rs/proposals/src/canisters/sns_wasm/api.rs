//! Rust code created from candid by: `scripts/did2rs.sh --canister sns_wasm --out api.rs --header did2rs.header --traits Serialize`
//! Candid for canister `sns_wasm` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/release-2024-06-12_23-01-base/rs/nns/sns-wasm/canister/sns-wasm.did>
#![allow(clippy::all)]
#![allow(missing_docs)]
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
// use candid::{self, CandidType, Deserialize, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, CandidType, Deserialize)]
pub struct SnsWasm {
    pub wasm: serde_bytes::ByteBuf,
    pub proposal_id: Option<u64>,
    pub canister_type: i32,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct AddWasmRequest {
    pub hash: serde_bytes::ByteBuf,
    pub wasm: Option<SnsWasm>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct SnsWasmError {
    pub message: String,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum Result_ {
    Error(SnsWasmError),
    Hash(serde_bytes::ByteBuf),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct AddWasmResponse {
    pub result: Option<Result_>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct SnsVersion {
    pub archive_wasm_hash: serde_bytes::ByteBuf,
    pub root_wasm_hash: serde_bytes::ByteBuf,
    pub swap_wasm_hash: serde_bytes::ByteBuf,
    pub ledger_wasm_hash: serde_bytes::ByteBuf,
    pub governance_wasm_hash: serde_bytes::ByteBuf,
    pub index_wasm_hash: serde_bytes::ByteBuf,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct SnsUpgrade {
    pub next_version: Option<SnsVersion>,
    pub current_version: Option<SnsVersion>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct InsertUpgradePathEntriesRequest {
    pub upgrade_path: Vec<SnsUpgrade>,
    pub sns_governance_canister_id: Option<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct InsertUpgradePathEntriesResponse {
    pub error: Option<SnsWasmError>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateAllowedPrincipalsRequest {
    pub added_principals: Vec<Principal>,
    pub removed_principals: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct GetAllowedPrincipalsResponse {
    pub allowed_principals: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub enum UpdateAllowedPrincipalsResult {
    Error(SnsWasmError),
    AllowedPrincipals(GetAllowedPrincipalsResponse),
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateAllowedPrincipalsResponse {
    pub update_allowed_principals_result: Option<UpdateAllowedPrincipalsResult>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateSnsSubnetListRequest {
    pub sns_subnet_ids_to_add: Vec<Principal>,
    pub sns_subnet_ids_to_remove: Vec<Principal>,
}
#[derive(Serialize, CandidType, Deserialize)]
pub struct UpdateSnsSubnetListResponse {
    pub error: Option<SnsWasmError>,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn add_wasm(&self, arg0: AddWasmRequest) -> CallResult<(AddWasmResponse,)> {
        ic_cdk::call(self.0, "add_wasm", (arg0,)).await
    }
    pub async fn insert_upgrade_path_entries(
        &self,
        arg0: InsertUpgradePathEntriesRequest,
    ) -> CallResult<(InsertUpgradePathEntriesResponse,)> {
        ic_cdk::call(self.0, "insert_upgrade_path_entries", (arg0,)).await
    }
    pub async fn update_allowed_principals(
        &self,
        arg0: UpdateAllowedPrincipalsRequest,
    ) -> CallResult<(UpdateAllowedPrincipalsResponse,)> {
        ic_cdk::call(self.0, "update_allowed_principals", (arg0,)).await
    }
    pub async fn update_sns_subnet_list(
        &self,
        arg0: UpdateSnsSubnetListRequest,
    ) -> CallResult<(UpdateSnsSubnetListResponse,)> {
        ic_cdk::call(self.0, "update_sns_subnet_list", (arg0,)).await
    }
}
