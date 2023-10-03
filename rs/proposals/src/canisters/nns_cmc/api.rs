#![allow(clippy::all)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult as Result;
use serde::Serialize;

// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// #![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(Serialize, CandidType, Deserialize)]
pub enum ExchangeRateCanister {
    Set(Principal),
    Unset,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct AccountIdentifier {
    pub bytes: serde_bytes::ByteBuf,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct CyclesCanisterInitPayload {
    pub exchange_rate_canister: Option<ExchangeRateCanister>,
    pub last_purged_notification: Option<u64>,
    pub governance_canister_id: Option<Principal>,
    pub minting_account_id: Option<AccountIdentifier>,
    pub ledger_canister_id: Option<Principal>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct IcpXdrConversionRate {
    pub xdr_permyriad_per_icp: u64,
    pub timestamp_seconds: u64,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct IcpXdrConversionRateResponse {
    pub certificate: serde_bytes::ByteBuf,
    pub data: IcpXdrConversionRate,
    pub hash_tree: serde_bytes::ByteBuf,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct PrincipalsAuthorizedToCreateCanistersToSubnetsResponse {
    pub data: Vec<(Principal, Vec<Principal>)>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct SubnetTypesToSubnetsResponse {
    pub data: Vec<(String, Vec<Principal>)>,
}

pub type BlockIndex = u64;
#[derive(Serialize, CandidType, Deserialize)]
pub struct CanisterSettings {
    pub freezing_threshold: Option<candid::Nat>,
    pub controllers: Option<Vec<Principal>>,
    pub reserved_cycles_limit: Option<candid::Nat>,
    pub memory_allocation: Option<candid::Nat>,
    pub compute_allocation: Option<candid::Nat>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NotifyCreateCanisterArg {
    pub controller: Principal,
    pub block_index: BlockIndex,
    pub settings: Option<CanisterSettings>,
    pub subnet_type: Option<String>,
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum NotifyError {
    Refunded {
        block_index: Option<BlockIndex>,
        reason: String,
    },
    InvalidTransaction(String),
    Other {
        error_message: String,
        error_code: u64,
    },
    Processing,
    TransactionTooOld(BlockIndex),
}

#[derive(Serialize, CandidType, Deserialize)]
pub enum NotifyCreateCanisterResult {
    Ok(Principal),
    Err(NotifyError),
}

#[derive(Serialize, CandidType, Deserialize)]
pub struct NotifyTopUpArg {
    pub block_index: BlockIndex,
    pub canister_id: Principal,
}

pub type Cycles = candid::Nat;
#[derive(Serialize, CandidType, Deserialize)]
pub enum NotifyTopUpResult {
    Ok(Cycles),
    Err(NotifyError),
}

pub struct Service(pub Principal);
impl Service {
    pub async fn get_icp_xdr_conversion_rate(&self) -> Result<(IcpXdrConversionRateResponse,)> {
        ic_cdk::call(self.0, "get_icp_xdr_conversion_rate", ()).await
    }
    pub async fn get_principals_authorized_to_create_canisters_to_subnets(
        &self,
    ) -> Result<(PrincipalsAuthorizedToCreateCanistersToSubnetsResponse,)> {
        ic_cdk::call(self.0, "get_principals_authorized_to_create_canisters_to_subnets", ()).await
    }
    pub async fn get_subnet_types_to_subnets(&self) -> Result<(SubnetTypesToSubnetsResponse,)> {
        ic_cdk::call(self.0, "get_subnet_types_to_subnets", ()).await
    }
    pub async fn notify_create_canister(&self, arg0: NotifyCreateCanisterArg) -> Result<(NotifyCreateCanisterResult,)> {
        ic_cdk::call(self.0, "notify_create_canister", (arg0,)).await
    }
    pub async fn notify_top_up(&self, arg0: NotifyTopUpArg) -> Result<(NotifyTopUpResult,)> {
        ic_cdk::call(self.0, "notify_top_up", (arg0,)).await
    }
}
