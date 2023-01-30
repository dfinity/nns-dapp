#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(clippy::all)]
#![allow(non_camel_case_types)]

use crate::types::{CandidType, Deserialize, Serialize};
use ic_cdk::api::call::CallResult;
// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
// use ic_cdk::export::candid::{self, CandidType, Deserialize, Serialize, Clone, Debug};
// use ic_cdk::api::call::CallResult;

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum Value { Int(candid::Int), Nat(candid::Nat), Blob(Vec<u8>), Text(String) }

pub type Subaccount = Vec<u8>;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Account { owner: candid::Principal, subaccount: Option<Subaccount> }

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct InitArgs_archive_options {
  pub  num_blocks_to_archive: u64,
  pub  trigger_threshold: u64,
  pub  max_message_size_bytes: Option<u64>,
  pub  cycles_for_archive_creation: Option<u64>,
  pub  node_max_memory_size_bytes: Option<u64>,
  pub  controller_id: candid::Principal,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct InitArgs {
  pub  token_symbol: String,
  pub  transfer_fee: u64,
  pub  metadata: Vec<(String,Value,)>,
  pub  minting_account: Account,
  pub  initial_balances: Vec<(Account,u64,)>,
  pub  archive_options: InitArgs_archive_options,
  pub  token_name: String,
}

pub type Tokens = candid::Nat;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct icrc1_supported_standards_ret0_inner { url: String, name: String }

pub type Timestamp = u64;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct TransferArg {
  pub  to: Account,
  pub  fee: Option<Tokens>,
  pub  memo: Option<Vec<u8>>,
  pub  from_subaccount: Option<Subaccount>,
  pub  created_at_time: Option<Timestamp>,
  pub  amount: Tokens,
}

pub type BlockIndex = candid::Nat;
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransferError {
  GenericError{ message: String, error_code: candid::Nat },
  TemporarilyUnavailable,
  BadBurn{ min_burn_amount: Tokens },
  Duplicate{ duplicate_of: BlockIndex },
  BadFee{ expected_fee: Tokens },
  CreatedInFuture{ ledger_time: u64 },
  TooOld,
  InsufficientFunds{ balance: Tokens },
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum TransferResult { Ok(BlockIndex), Err(TransferError) }

pub struct SERVICE(candid::Principal);
impl SERVICE{
  pub async fn icrc1_balance_of(&self, arg0: Account) -> CallResult<(Tokens,)> {
    ic_cdk::call(self.0, "icrc1_balance_of", (arg0,)).await
  }
  pub async fn icrc1_decimals(&self) -> CallResult<(u8,)> {
    ic_cdk::call(self.0, "icrc1_decimals", ()).await
  }
  pub async fn icrc1_fee(&self) -> CallResult<(Tokens,)> {
    ic_cdk::call(self.0, "icrc1_fee", ()).await
  }
  pub async fn icrc1_metadata(&self) -> CallResult<(Vec<(String,Value,)>,)> {
    ic_cdk::call(self.0, "icrc1_metadata", ()).await
  }
  pub async fn icrc1_minting_account(&self) -> CallResult<(Option<Account>,)> {
    ic_cdk::call(self.0, "icrc1_minting_account", ()).await
  }
  pub async fn icrc1_name(&self) -> CallResult<(String,)> {
    ic_cdk::call(self.0, "icrc1_name", ()).await
  }
  pub async fn icrc1_supported_standards(&self) -> CallResult<
    (Vec<icrc1_supported_standards_ret0_inner>,)
  > { ic_cdk::call(self.0, "icrc1_supported_standards", ()).await }
  pub async fn icrc1_symbol(&self) -> CallResult<(String,)> {
    ic_cdk::call(self.0, "icrc1_symbol", ()).await
  }
  pub async fn icrc1_total_supply(&self) -> CallResult<(Tokens,)> {
    ic_cdk::call(self.0, "icrc1_total_supply", ()).await
  }
  pub async fn icrc1_transfer(&self, arg0: TransferArg) -> CallResult<
    (TransferResult,)
  > { ic_cdk::call(self.0, "icrc1_transfer", (arg0,)).await }
}
