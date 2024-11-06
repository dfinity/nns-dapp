//! Rust code created from candid by: `scripts/did2rs.sh --canister sns_ledger --out ic_sns_ledger.rs --header did2rs.header --traits Serialize\,\ Clone\,\ Debug`
//! Candid for canister `sns_ledger` obtained by `scripts/update_ic_commit` from: <https://raw.githubusercontent.com/dfinity/ic/release-2024-10-31_03-09-ubuntu20.04/rs/ledger_suite/icrc1/ledger/ledger.did>
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
pub struct ChangeArchiveOptions {
    pub num_blocks_to_archive: Option<u64>,
    pub max_transactions_per_response: Option<u64>,
    pub trigger_threshold: Option<u64>,
    pub more_controller_ids: Option<Vec<Principal>>,
    pub max_message_size_bytes: Option<u64>,
    pub cycles_for_archive_creation: Option<u64>,
    pub node_max_memory_size_bytes: Option<u64>,
    pub controller_id: Option<Principal>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum MetadataValue {
    Int(candid::Int),
    Nat(candid::Nat),
    Blob(serde_bytes::ByteBuf),
    Text(String),
}
pub type Subaccount = serde_bytes::ByteBuf;
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Subaccount>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum ChangeFeeCollector {
    SetTo(Account),
    Unset,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct FeatureFlags {
    pub icrc2: bool,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct UpgradeArgs {
    pub change_archive_options: Option<ChangeArchiveOptions>,
    pub token_symbol: Option<String>,
    pub transfer_fee: Option<candid::Nat>,
    pub metadata: Option<Vec<(String, MetadataValue)>>,
    pub accounts_overflow_trim_quantity: Option<u64>,
    pub change_fee_collector: Option<ChangeFeeCollector>,
    pub max_memo_length: Option<u16>,
    pub token_name: Option<String>,
    pub feature_flags: Option<FeatureFlags>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct InitArgsArchiveOptions {
    pub num_blocks_to_archive: u64,
    pub max_transactions_per_response: Option<u64>,
    pub trigger_threshold: u64,
    pub more_controller_ids: Option<Vec<Principal>>,
    pub max_message_size_bytes: Option<u64>,
    pub cycles_for_archive_creation: Option<u64>,
    pub node_max_memory_size_bytes: Option<u64>,
    pub controller_id: Principal,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum LedgerArg {
    Upgrade(Option<UpgradeArgs>),
    Init(InitArgs),
}
pub type BlockIndex = candid::Nat;
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct ArchiveInfo {
    pub block_range_end: BlockIndex,
    pub canister_id: Principal,
    pub block_range_start: BlockIndex,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetBlocksArgs {
    pub start: BlockIndex,
    pub length: candid::Nat,
}
pub type Map = Vec<(String, Box<Value>)>;
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct DataCertificate {
    pub certificate: Option<serde_bytes::ByteBuf>,
    pub hash_tree: serde_bytes::ByteBuf,
}
pub type TxIndex = candid::Nat;
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetTransactionsRequest {
    pub start: TxIndex,
    pub length: candid::Nat,
}
pub type Timestamp = u64;
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Burn {
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
    pub spender: Option<Account>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Mint {
    pub to: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Transfer {
    pub to: Account,
    pub fee: Option<candid::Nat>,
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: candid::Nat,
    pub spender: Option<Account>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Transaction {
    pub burn: Option<Burn>,
    pub kind: String,
    pub mint: Option<Mint>,
    pub approve: Option<Approve>,
    pub timestamp: Timestamp,
    pub transfer: Option<Transfer>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc10SupportedStandardsRetItem {
    pub url: String,
    pub name: String,
}
pub type Tokens = candid::Nat;
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct StandardRecord {
    pub url: String,
    pub name: String,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct TransferArg {
    pub to: Account,
    pub fee: Option<Tokens>,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub from_subaccount: Option<Subaccount>,
    pub created_at_time: Option<Timestamp>,
    pub amount: Tokens,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum TransferResult {
    Ok(BlockIndex),
    Err(TransferError),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc21ConsentMessageMetadata {
    pub utc_offset_minutes: Option<i16>,
    pub language: String,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Icrc21ConsentMessageSpecDeviceSpecInner {
    GenericDisplay,
    LineDisplay {
        characters_per_line: u16,
        lines_per_page: u16,
    },
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc21ConsentMessageSpec {
    pub metadata: Icrc21ConsentMessageMetadata,
    pub device_spec: Option<Icrc21ConsentMessageSpecDeviceSpecInner>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc21ConsentMessageRequest {
    pub arg: serde_bytes::ByteBuf,
    pub method: String,
    pub user_preferences: Icrc21ConsentMessageSpec,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc21ConsentMessageLineDisplayMessagePagesItem {
    pub lines: Vec<String>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Icrc21ConsentMessage {
    LineDisplayMessage {
        pages: Vec<Icrc21ConsentMessageLineDisplayMessagePagesItem>,
    },
    GenericDisplayMessage(String),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc21ConsentInfo {
    pub metadata: Icrc21ConsentMessageMetadata,
    pub consent_message: Icrc21ConsentMessage,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc21ErrorInfo {
    pub description: String,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Icrc21Error {
    GenericError {
        description: String,
        error_code: candid::Nat,
    },
    InsufficientPayment(Icrc21ErrorInfo),
    UnsupportedCanisterCall(Icrc21ErrorInfo),
    ConsentMessageUnavailable(Icrc21ErrorInfo),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Icrc21ConsentMessageResponse {
    Ok(Icrc21ConsentInfo),
    Err(Icrc21Error),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct AllowanceArgs {
    pub account: Account,
    pub spender: Account,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Allowance {
    pub allowance: candid::Nat,
    pub expires_at: Option<Timestamp>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum ApproveResult {
    Ok(BlockIndex),
    Err(ApproveError),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct TransferFromArgs {
    pub to: Account,
    pub fee: Option<Tokens>,
    pub spender_subaccount: Option<Subaccount>,
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<Timestamp>,
    pub amount: Tokens,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
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
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum TransferFromResult {
    Ok(BlockIndex),
    Err(TransferFromError),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetArchivesArgs {
    pub from: Option<Principal>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetArchivesResultItem {
    pub end: candid::Nat,
    pub canister_id: Principal,
    pub start: candid::Nat,
}
pub type GetArchivesResult = Vec<GetArchivesResultItem>;
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub enum Icrc3Value {
    Int(candid::Int),
    Map(Vec<(String, Box<Icrc3Value>)>),
    Nat(candid::Nat),
    Blob(serde_bytes::ByteBuf),
    Text(String),
    Array(Vec<Box<Icrc3Value>>),
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct GetBlocksResultBlocksItem {
    pub id: candid::Nat,
    pub block: Box<Icrc3Value>,
}
pub type GetBlocksResultArchivedBlocksItemCallback = candid::Func;
#[derive(CandidType, Deserialize)]
pub struct GetBlocksResultArchivedBlocksItem {
    pub args: Vec<GetBlocksArgs>,
    pub callback: GetBlocksResultArchivedBlocksItemCallback,
}
#[derive(CandidType, Deserialize)]
pub struct GetBlocksResult {
    pub log_length: candid::Nat,
    pub blocks: Vec<GetBlocksResultBlocksItem>,
    pub archived_blocks: Vec<GetBlocksResultArchivedBlocksItem>,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc3DataCertificate {
    pub certificate: serde_bytes::ByteBuf,
    pub hash_tree: serde_bytes::ByteBuf,
}
#[derive(Serialize, Clone, Debug, CandidType, Deserialize)]
pub struct Icrc3SupportedBlockTypesRetItem {
    pub url: String,
    pub block_type: String,
}

pub struct Service(pub Principal);
impl Service {
    pub async fn archives(&self) -> CallResult<(Vec<ArchiveInfo>,)> {
        ic_cdk::call(self.0, "archives", ()).await
    }
    pub async fn get_blocks(&self, arg0: GetBlocksArgs) -> CallResult<(GetBlocksResponse,)> {
        ic_cdk::call(self.0, "get_blocks", (arg0,)).await
    }
    pub async fn get_data_certificate(&self) -> CallResult<(DataCertificate,)> {
        ic_cdk::call(self.0, "get_data_certificate", ()).await
    }
    pub async fn get_transactions(&self, arg0: GetTransactionsRequest) -> CallResult<(GetTransactionsResponse,)> {
        ic_cdk::call(self.0, "get_transactions", (arg0,)).await
    }
    pub async fn icrc_10_supported_standards(&self) -> CallResult<(Vec<Icrc10SupportedStandardsRetItem>,)> {
        ic_cdk::call(self.0, "icrc10_supported_standards", ()).await
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
    pub async fn icrc_21_canister_call_consent_message(
        &self,
        arg0: Icrc21ConsentMessageRequest,
    ) -> CallResult<(Icrc21ConsentMessageResponse,)> {
        ic_cdk::call(self.0, "icrc21_canister_call_consent_message", (arg0,)).await
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
    pub async fn icrc_3_get_archives(&self, arg0: GetArchivesArgs) -> CallResult<(GetArchivesResult,)> {
        ic_cdk::call(self.0, "icrc3_get_archives", (arg0,)).await
    }
    pub async fn icrc_3_get_blocks(&self, arg0: Vec<GetBlocksArgs>) -> CallResult<(GetBlocksResult,)> {
        ic_cdk::call(self.0, "icrc3_get_blocks", (arg0,)).await
    }
    pub async fn icrc_3_get_tip_certificate(&self) -> CallResult<(Option<Icrc3DataCertificate>,)> {
        ic_cdk::call(self.0, "icrc3_get_tip_certificate", ()).await
    }
    pub async fn icrc_3_supported_block_types(&self) -> CallResult<(Vec<Icrc3SupportedBlockTypesRetItem>,)> {
        ic_cdk::call(self.0, "icrc3_supported_block_types", ()).await
    }
}
