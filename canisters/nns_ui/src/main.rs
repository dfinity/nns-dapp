use candid::CandidType;
use crate::canister_store::{
    AttachCanisterResponse,
    AttachCanisterRequest,
    DetachCanisterRequest,
    DetachCanisterResponse,
    NamedCanister
};
use crate::state::{StableState, STATE, State};
use crate::transaction_store::{
    AccountDetails,
    CreateSubAccountResponse,
    GetTransactionsRequest,
    GetTransactionsResponse,
    RegisterHardwareWalletRequest,
    RegisterHardwareWalletResponse,
    Stats
};
use dfn_candid::{candid, candid_one};
use dfn_core::{stable, over, over_async};
use ledger_canister::AccountIdentifier;

mod canister_store;
mod ledger;
mod ledger_sync;
mod state;
mod transaction_store;

const PRUNE_TRANSACTIONS_COUNT: u32 = 1000;
const CYCLES_PER_XDR: u64 = 1_000_000_000_000;

#[export_name = "canister_init"]
fn main() {}

#[export_name = "canister_pre_upgrade"]
fn pre_upgrade() {
    let state = STATE.read().unwrap();
    let bytes = state.encode();
    stable::set(&bytes);
}

#[export_name = "canister_post_upgrade"]
fn post_upgrade() {
    let bytes = stable::get();
    *STATE.write().unwrap() = State::decode(bytes).expect("Decoding stable memory failed");
}

#[export_name = "canister_query get_account"]
pub fn get_account() {
    over(candid, |()| get_account_impl());
}

fn get_account_impl() -> GetAccountResponse {
    let principal = dfn_core::api::caller();
    let store = &STATE.read().unwrap().transactions_store;
    if let Some(account) = store.get_account(principal) {
        GetAccountResponse::Ok(account)
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

#[export_name = "canister_update register_hardware_wallet"]
pub fn register_hardware_wallet() {
    over(candid_one, register_hardware_wallet_impl);
}

fn register_hardware_wallet_impl(request: RegisterHardwareWalletRequest) -> RegisterHardwareWalletResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().transactions_store;
    store.register_hardware_wallet(principal, request)
}

#[export_name = "canister_query get_canisters"]
pub fn get_canisters() {
    over(candid, |()| get_canisters_impl());
}

fn get_canisters_impl() -> Vec<NamedCanister> {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().canisters_store;
    store.get_canisters(&principal)
}

#[export_name = "canister_update attach_canister"]
pub fn attach_canister() {
    over(candid_one, attach_canister_impl);
}

fn attach_canister_impl(request: AttachCanisterRequest) -> AttachCanisterResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().canisters_store;
    store.attach_canister(principal, request)
}

#[export_name = "canister_update detach_canister"]
pub fn detach_canister() {
    over(candid_one, detach_canister_impl);
}

fn detach_canister_impl(request: DetachCanisterRequest) -> DetachCanisterResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().canisters_store;
    store.detach_canister(principal, request)
}

#[export_name = "canister_query get_icp_to_cycles_conversion_rate"]
pub fn get_icp_to_cycles_conversion_rate() {
    over_async(candid, |()| get_icp_to_cycles_conversion_rate_impl());
}

async fn get_icp_to_cycles_conversion_rate_impl() -> u64 {
    let xdr_permyriad_per_icp = match ic_nns_common::registry::get_icp_xdr_conversion_rate_record().await {
        None => 1_000_000, // TODO: put the panic back in! // Using 1 ICP = 100 XDR // panic!("ICP/XDR conversion rate is not available."),
        Some((rate_record, _)) => rate_record.xdr_permyriad_per_icp,
    };

    xdr_permyriad_per_icp * (CYCLES_PER_XDR / 10_000)
}

#[export_name = "canister_query get_stats"]
pub fn get_stats() {
    over(candid, |()| get_stats_impl());
}

fn get_stats_impl() -> Stats {
    let store = &STATE.read().unwrap().transactions_store;
    store.get_stats()
}

#[export_name = "canister_update sync_transactions"]
pub fn ledger_sync_manual() {
    ledger_sync();
}

#[export_name = "canister_heartbeat"]
pub fn ledger_sync() {
    over_async(candid, |()| ledger_sync_impl());
}

async fn ledger_sync_impl() -> Option<Result<u32, String>> {
    dfn_core::api::print("sync_transactions started");
    let result = ledger_sync::sync_transactions().await;
    dfn_core::api::print(format!("sync_transactions completed. Count added = {:?}", result));

    if should_prune_transactions() {
        let store = &mut STATE.write().unwrap().transactions_store;
        store.prune_transactions(PRUNE_TRANSACTIONS_COUNT);
    }

    result
}

fn should_prune_transactions() -> bool {
    #[cfg(target_arch = "wasm32")]
    {
        const MEMORY_LIMIT_BYTES: u32 = 1024 * 1024 * 1024; // 1GB
        let memory_usage_bytes = (core::arch::wasm32::memory_size(0) * 65536) as u32;
        memory_usage_bytes > MEMORY_LIMIT_BYTES
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        const TRANSACTIONS_COUNT_LIMIT: u32 = 1_000_000;
        let store = &mut STATE.write().unwrap().transactions_store;
        let transactions_count = store.get_transactions_count();
        transactions_count > TRANSACTIONS_COUNT_LIMIT
    }
}

#[derive(CandidType)]
pub enum GetAccountResponse {
    Ok(AccountDetails),
    AccountNotFound
}
