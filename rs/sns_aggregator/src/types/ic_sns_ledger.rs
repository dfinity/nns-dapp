#![allow(clippy::all)]
#![allow(unused_imports)]
#![allow(clippy::missing_docs_in_private_items)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]

use crate::types::{CandidType, Deserialize, EmptyRecord, Serialize};
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
// use candid::{self, CandidType, Decode, Deserialize, Serialize, Clone, Debug, Encode, candid::Principal};
// use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum MetadataValue {
    Int(candid::Int),
    Nat(candid::Nat),
    Blob(serde_bytes::ByteBuf),
    Text(String),
}

pub type Subaccount = serde_bytes::ByteBuf;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Account {
    pub owner: candid::Principal,
    pub subaccount: Option<Subaccount>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ChangeFeeCollector {
    SetTo(Account),
    Unset,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FeatureFlags {
    pub icrc2: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UpgradeArgs {
    pub token_symbol: Option<String>,
    pub transfer_fee: Option<candid::Nat>,
    pub metadata: Option<Vec<(String, MetadataValue)>>,
    pub maximum_number_of_accounts: Option<u64>,
    pub accounts_overflow_trim_quantity: Option<u64>,
    pub change_fee_collector: Option<ChangeFeeCollector>,
    pub max_memo_length: Option<u16>,
    pub token_name: Option<String>,
    pub feature_flags: Option<FeatureFlags>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct InitArgsArchiveOptions {
    pub num_blocks_to_archive: u64,
    pub max_transactions_per_response: Option<u64>,
    pub trigger_threshold: u64,
    pub max_message_size_bytes: Option<u64>,
    pub cycles_for_archive_creation: Option<u64>,
    pub node_max_memory_size_bytes: Option<u64>,
    pub controller_id: candid::Principal,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct InitArgs {
    pub decimals: Option<u8>,
    pub token_symbol: String,
    pub transfer_fee: candid::Nat,
    pub metadata: Vec<(String, MetadataValue)>,
    pub minting_account: Account,
    pub initial_balances: Vec<(Account, candid::Nat)>,
    pub maximum_number_of_accounts: Option<u64>,
    pub accounts_overflow_trim_quantity: Option<u64>,
    pub fee_collector_account: Option<Account>,
    pub archive_options: InitArgsArchiveOptions,
    pub max_memo_length: Option<u16>,
    pub token_name: String,
    pub feature_flags: Option<FeatureFlags>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum LedgerArg {
    Upgrade(Option<UpgradeArgs>),
    Init(InitArgs),
}

pub type BlockIndex = candid::Nat;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetBlocksArgs {
    pub start: BlockIndex,
    pub length: candid::Nat,
}

pub type Map = Vec<(String, Box<Value>)>;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Value {
    Int(candid::Int),
    Map(Map),
    Nat(candid::Nat),
    Nat64(u64),
    Blob(serde_bytes::ByteBuf),
    Text(String),
    Array(Vec<Box<Value>>),
}

pub type Block = Box<Value>;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct BlockRange {
    pub blocks: Vec<Block>,
}

pub type QueryBlockArchiveFn = candid::Func;
#[derive(CandidType, Deserialize)]
pub struct GetBlocksResponseArchivedBlocksItem {
    pub callback: QueryBlockArchiveFn,
    pub start: BlockIndex,
    pub length: candid::Nat,
}

#[derive(CandidType, Deserialize)]
pub struct GetBlocksResponse {
    pub certificate: Option<serde_bytes::ByteBuf>,
    pub first_index: BlockIndex,
    pub blocks: Vec<Block>,
    pub chain_length: u64,
    pub archived_blocks: Vec<GetBlocksResponseArchivedBlocksItem>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct DataCertificate {
    pub certificate: Option<serde_bytes::ByteBuf>,
    pub hash_tree: serde_bytes::ByteBuf,
}

pub type TxIndex = candid::Nat;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct GetTransactionsRequest {
    pub start: TxIndex,
    pub length: candid::Nat,
}

pub type Timestamp = u64;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Burn {
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
    pub spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Mint {
    pub to: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Approve {
    pub fee: Option<candid::Nat>,
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
    pub expected_allowance: Option<candid::Nat>,
    pub expires_at: Option<Timestamp>,
    pub spender: Account,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Transfer {
    pub to: Account,
    pub fee: Option<candid::Nat>,
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
    pub spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Transaction {
    pub burn: Option<Burn>,
    pub kind: String,
    pub mint: Option<Mint>,
    pub approve: Option<Approve>,
    pub timestamp: Timestamp,
    pub transfer: Option<Transfer>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TransactionRange {
    pub transactions: Vec<Transaction>,
}

pub type QueryArchiveFn = candid::Func;
#[derive(CandidType, Deserialize)]
pub struct GetTransactionsResponseArchivedTransactionsItem {
    pub callback: QueryArchiveFn,
    pub start: TxIndex,
    pub length: candid::Nat,
}

#[derive(CandidType, Deserialize)]
pub struct GetTransactionsResponse {
    pub first_index: TxIndex,
    pub log_length: candid::Nat,
    pub transactions: Vec<Transaction>,
    pub archived_transactions: Vec<GetTransactionsResponseArchivedTransactionsItem>,
}

pub type Tokens = candid::Nat;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StandardRecord {
    pub url: String,
    pub name: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TransferArg {
    pub to: Account,
    pub fee: Option<Tokens>,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub from_subaccount: Option<Subaccount>,
    pub created_at_time: Option<Timestamp>,
    pub amount: Tokens,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransferError {
    GenericError { message: String, error_code: candid::Nat },
    TemporarilyUnavailable,
    BadBurn { min_burn_amount: Tokens },
    Duplicate { duplicate_of: BlockIndex },
    BadFee { expected_fee: Tokens },
    CreatedInFuture { ledger_time: Timestamp },
    TooOld,
    InsufficientFunds { balance: Tokens },
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransferResult {
    Ok(BlockIndex),
    Err(TransferError),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct AllowanceArgs {
    pub account: Account,
    pub spender: Account,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Allowance {
    pub allowance: candid::Nat,
    pub expires_at: Option<Timestamp>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ApproveArgs {
    pub fee: Option<candid::Nat>,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub from_subaccount: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
    pub expected_allowance: Option<candid::Nat>,
    pub expires_at: Option<Timestamp>,
    pub spender: Account,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ApproveError {
    GenericError { message: String, error_code: candid::Nat },
    TemporarilyUnavailable,
    Duplicate { duplicate_of: BlockIndex },
    BadFee { expected_fee: candid::Nat },
    AllowanceChanged { current_allowance: candid::Nat },
    CreatedInFuture { ledger_time: Timestamp },
    TooOld,
    Expired { ledger_time: Timestamp },
    InsufficientFunds { balance: candid::Nat },
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ApproveResult {
    Ok(BlockIndex),
    Err(ApproveError),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TransferFromArgs {
    pub to: Account,
    pub fee: Option<Tokens>,
    pub spender_subaccount: Option<Subaccount>,
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: Tokens,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransferFromError {
    GenericError { message: String, error_code: candid::Nat },
    TemporarilyUnavailable,
    InsufficientAllowance { allowance: Tokens },
    BadBurn { min_burn_amount: Tokens },
    Duplicate { duplicate_of: BlockIndex },
    BadFee { expected_fee: Tokens },
    CreatedInFuture { ledger_time: Timestamp },
    TooOld,
    InsufficientFunds { balance: Tokens },
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransferFromResult {
    Ok(BlockIndex),
    Err(TransferFromError),
}

pub struct Service(pub candid::Principal);
impl Service {
    pub async fn get_blocks(&self, arg0: GetBlocksArgs) -> CallResult<(GetBlocksResponse,)> {
        ic_cdk::call(self.0, "get_blocks", (arg0,)).await
    }
    pub async fn get_data_certificate(&self) -> CallResult<(DataCertificate,)> {
        ic_cdk::call(self.0, "get_data_certificate", ()).await
    }
    pub async fn get_transactions(&self, arg0: GetTransactionsRequest) -> CallResult<(GetTransactionsResponse,)> {
        ic_cdk::call(self.0, "get_transactions", (arg0,)).await
    }
    pub async fn icrc_1_balance_of(&self, arg0: Account) -> CallResult<(Tokens,)> {
        ic_cdk::call(self.0, "icrc1_balance_of", (arg0,)).await
    }
    pub async fn icrc_1_decimals(&self) -> CallResult<(u8,)> {
        ic_cdk::call(self.0, "icrc1_decimals", ()).await
    }
    pub async fn icrc_1_fee(&self) -> CallResult<(Tokens,)> {
        ic_cdk::call(self.0, "icrc1_fee", ()).await
    }
    pub async fn icrc_1_metadata(&self) -> CallResult<(Vec<(String, MetadataValue)>,)> {
        ic_cdk::call(self.0, "icrc1_metadata", ()).await
    }
    pub async fn icrc_1_minting_account(&self) -> CallResult<(Option<Account>,)> {
        ic_cdk::call(self.0, "icrc1_minting_account", ()).await
    }
    pub async fn icrc_1_name(&self) -> CallResult<(String,)> {
        ic_cdk::call(self.0, "icrc1_name", ()).await
    }
    pub async fn icrc_1_supported_standards(&self) -> CallResult<(Vec<StandardRecord>,)> {
        ic_cdk::call(self.0, "icrc1_supported_standards", ()).await
    }
    pub async fn icrc_1_symbol(&self) -> CallResult<(String,)> {
        ic_cdk::call(self.0, "icrc1_symbol", ()).await
    }
    pub async fn icrc_1_total_supply(&self) -> CallResult<(Tokens,)> {
        ic_cdk::call(self.0, "icrc1_total_supply", ()).await
    }
    pub async fn icrc_1_transfer(&self, arg0: TransferArg) -> CallResult<(TransferResult,)> {
        ic_cdk::call(self.0, "icrc1_transfer", (arg0,)).await
    }
    pub async fn icrc_2_allowance(&self, arg0: AllowanceArgs) -> CallResult<(Allowance,)> {
        ic_cdk::call(self.0, "icrc2_allowance", (arg0,)).await
    }
    pub async fn icrc_2_approve(&self, arg0: ApproveArgs) -> CallResult<(ApproveResult,)> {
        ic_cdk::call(self.0, "icrc2_approve", (arg0,)).await
    }
    pub async fn icrc_2_transfer_from(&self, arg0: TransferFromArgs) -> CallResult<(TransferFromResult,)> {
        ic_cdk::call(self.0, "icrc2_transfer_from", (arg0,)).await
    }
}
