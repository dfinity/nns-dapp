use candid::CandidType;
use crate::state::{STATE, State};
use crate::transaction_store::{GetTransactionsRequest, GetTransactionsResponse, CreateSubAccountResponse, SubAccountResponse};
use dfn_candid::{candid, candid_one};
use dfn_core::{stable, over, over_async};
use ledger_canister::AccountIdentifier;

mod ledger_sync;
mod state;
mod transaction_store;

#[export_name = "canister_init"]
fn main() {}

#[export_name = "canister_post_upgrade"]
fn post_upgrade() {
    let bytes = stable::get();
    *STATE.write().unwrap() = State::decode(&bytes).expect("Decoding stable memory failed");
}

#[export_name = "canister_pre_upgrade"]
fn pre_upgrade() {
    let state = STATE.read().unwrap();
    let bytes = state.encode();
    stable::set(&bytes);
}

#[export_name = "canister_query get_account"]
pub fn get_account() {
    over(candid, |()| get_account_impl());
}

fn get_account_impl() -> GetAccountResponse {
    let principal = dfn_core::api::caller();
    let store = &STATE.read().unwrap().transactions_store;
    if store.check_account_exists(principal) {
        let account_identifier = AccountIdentifier::from(principal);
        let sub_accounts = store.get_sub_accounts(principal);
        GetAccountResponse::Ok { account_identifier, sub_accounts }
    } else {
        GetAccountResponse::AccountNotFound
    }
}

#[export_name = "canister_update add_account"]
pub fn add_account() {
    over(candid, |()| add_account_impl());
}

fn add_account_impl() -> AccountIdentifier {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().transactions_store;
    store.add_account(principal);
    AccountIdentifier::from(principal)
}

#[export_name = "canister_query get_transactions"]
pub fn get_transactions() {
    over(candid_one, get_transactions_impl);
}

fn get_transactions_impl(request: GetTransactionsRequest) -> GetTransactionsResponse {
    let principal = dfn_core::api::caller();
    let store = &STATE.read().unwrap().transactions_store;
    store.get_transactions(principal, request)
}

#[export_name = "canister_update create_sub_account"]
pub fn create_sub_account() {
    over(candid_one, create_sub_account_impl);
}

fn create_sub_account_impl(sub_account_name: String) -> CreateSubAccountResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().transactions_store;
    store.create_sub_account(principal, sub_account_name)
}

#[export_name = "canister_update sync_transactions"]
pub fn ledger_sync_manual() {
    ledger_sync();
}

#[export_name = "canister_heartbeat"]
pub fn ledger_sync() {
    over_async(candid, |()| async {
        dfn_core::api::print("sync_transactions started");
        let result = ledger_sync::sync_transactions().await;
        dfn_core::api::print(format!("sync_transactions completed. Count added = {:?}", result));
    });
}

#[derive(CandidType)]
pub enum GetAccountResponse {
    Ok { account_identifier: AccountIdentifier, sub_accounts: Vec<SubAccountResponse> },
    AccountNotFound
}
