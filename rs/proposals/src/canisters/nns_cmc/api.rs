// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize)]
pub enum ExchangeRateCanister {
    Set(Principal),
    Unset,
}

#[derive(CandidType, Deserialize)]
pub struct AccountIdentifier {
    bytes: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct CyclesCanisterInitPayload {
    exchange_rate_canister: Option<ExchangeRateCanister>,
    last_purged_notification: Option<u64>,
    governance_canister_id: Option<Principal>,
    minting_account_id: Option<AccountIdentifier>,
    ledger_canister_id: Option<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct IcpXdrConversionRate {
    xdr_permyriad_per_icp: u64,
    timestamp_seconds: u64,
}

#[derive(CandidType, Deserialize)]
pub struct IcpXdrConversionRateResponse {
    certificate: serde_bytes::ByteBuf,
    data: IcpXdrConversionRate,
    hash_tree: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct PrincipalsAuthorizedToCreateCanistersToSubnetsResponse {
    data: Vec<(Principal, Vec<Principal>)>,
}

#[derive(CandidType, Deserialize)]
pub struct SubnetTypesToSubnetsResponse {
    data: Vec<(String, Vec<Principal>)>,
}

pub type BlockIndex = u64;
#[derive(CandidType, Deserialize)]
pub struct CanisterSettings {
    freezing_threshold: Option<candid::Nat>,
    controllers: Option<Vec<Principal>>,
    reserved_cycles_limit: Option<candid::Nat>,
    memory_allocation: Option<candid::Nat>,
    compute_allocation: Option<candid::Nat>,
}

#[derive(CandidType, Deserialize)]
pub struct NotifyCreateCanisterArg {
    controller: Principal,
    block_index: BlockIndex,
    settings: Option<CanisterSettings>,
    subnet_type: Option<String>,
}

#[derive(CandidType, Deserialize)]
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

#[derive(CandidType, Deserialize)]
pub enum NotifyCreateCanisterResult {
    Ok(Principal),
    Err(NotifyError),
}

#[derive(CandidType, Deserialize)]
pub struct NotifyTopUpArg {
    block_index: BlockIndex,
    canister_id: Principal,
}

pub type Cycles = candid::Nat;
#[derive(CandidType, Deserialize)]
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
