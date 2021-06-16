use crate::accounts_store::{
    AccountDetails, AttachCanisterRequest, AttachCanisterResponse, CreateSubAccountResponse,
    DetachCanisterRequest, DetachCanisterResponse, GetTransactionsRequest, GetTransactionsResponse,
    NamedCanister, RegisterHardwareWalletRequest, RegisterHardwareWalletResponse,
    RemoveHardwareWalletRequest, RemoveHardwareWalletResponse, RenameSubAccountRequest,
    RenameSubAccountResponse, Stats,
};
use crate::multi_part_transactions_processor::{
    MultiPartTransactionError, MultiPartTransactionStatus,
};
use crate::periodic_tasks_runner::run_periodic_tasks;
use crate::state::{StableState, State, STATE};
use candid::CandidType;
use dfn_candid::{candid, candid_one};
use dfn_core::{over, over_async, stable};
use ledger_canister::{AccountIdentifier, BlockHeight};

mod accounts_store;
mod assets;
mod canisters;
mod constants;
mod ledger_sync;
mod multi_part_transactions_processor;
mod periodic_tasks_runner;
mod state;

#[export_name = "canister_init"]
fn main() {
    assets::init_assets();
}

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

    assets::init_assets();
}

#[export_name = "canister_query http_request"]
pub fn http_request() {
    over(candid_one, assets::http_request);
}

#[export_name = "canister_query get_account"]
pub fn get_account() {
    over(candid, |()| get_account_impl());
}

fn get_account_impl() -> GetAccountResponse {
    let principal = dfn_core::api::caller();
    let store = &STATE.read().unwrap().accounts_store;
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
    let store = &mut STATE.write().unwrap().accounts_store;
    store.add_account(principal);
    AccountIdentifier::from(principal)
}

#[export_name = "canister_query get_transactions"]
pub fn get_transactions() {
    over(candid_one, get_transactions_impl);
}

fn get_transactions_impl(request: GetTransactionsRequest) -> GetTransactionsResponse {
    let principal = dfn_core::api::caller();
    let store = &STATE.read().unwrap().accounts_store;
    store.get_transactions(principal, request)
}

#[export_name = "canister_update create_sub_account"]
pub fn create_sub_account() {
    over(candid_one, create_sub_account_impl);
}

fn create_sub_account_impl(sub_account_name: String) -> CreateSubAccountResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().accounts_store;
    store.create_sub_account(principal, sub_account_name)
}

#[export_name = "canister_update rename_sub_account"]
pub fn rename_sub_account() {
    over(candid_one, rename_sub_account_impl);
}

fn rename_sub_account_impl(request: RenameSubAccountRequest) -> RenameSubAccountResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().accounts_store;
    store.rename_sub_account(principal, request)
}

#[export_name = "canister_update register_hardware_wallet"]
pub fn register_hardware_wallet() {
    over(candid_one, register_hardware_wallet_impl);
}

fn register_hardware_wallet_impl(
    request: RegisterHardwareWalletRequest,
) -> RegisterHardwareWalletResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().accounts_store;
    store.register_hardware_wallet(principal, request)
}

#[export_name = "canister_update remove_hardware_wallet"]
pub fn remove_hardware_wallet() {
    over(candid_one, remove_hardware_wallet_impl);
}

fn remove_hardware_wallet_impl(
    request: RemoveHardwareWalletRequest,
) -> RemoveHardwareWalletResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().accounts_store;
    store.remove_hardware_wallet(principal, request)
}

#[export_name = "canister_query get_canisters"]
pub fn get_canisters() {
    over(candid, |()| get_canisters_impl());
}

fn get_canisters_impl() -> Vec<NamedCanister> {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().accounts_store;
    store.get_canisters(principal)
}

#[export_name = "canister_update attach_canister"]
pub fn attach_canister() {
    over(candid_one, attach_canister_impl);
}

fn attach_canister_impl(request: AttachCanisterRequest) -> AttachCanisterResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().accounts_store;
    store.attach_canister(principal, request)
}

#[export_name = "canister_update detach_canister"]
pub fn detach_canister() {
    over(candid_one, detach_canister_impl);
}

fn detach_canister_impl(request: DetachCanisterRequest) -> DetachCanisterResponse {
    let principal = dfn_core::api::caller();
    let store = &mut STATE.write().unwrap().accounts_store;
    store.detach_canister(principal, request)
}

#[export_name = "canister_query get_multi_part_transaction_status"]
pub fn get_multi_part_transaction_status() {
    over(candid_one, get_multi_part_transaction_status_impl);
}

fn get_multi_part_transaction_status_impl(block_height: BlockHeight) -> MultiPartTransactionStatus {
    let principal = dfn_core::api::caller();
    let store = &STATE.read().unwrap().accounts_store;
    store.get_multi_part_transaction_status(principal, block_height)
}

#[export_name = "canister_query get_multi_part_transaction_errors"]
pub fn get_multi_part_transaction_errors() {
    over(candid, |()| get_multi_part_transaction_errors_impl());
}

fn get_multi_part_transaction_errors_impl() -> Vec<MultiPartTransactionError> {
    let store = &STATE.read().unwrap().accounts_store;
    store.get_multi_part_transaction_errors()
}

#[export_name = "canister_query get_icp_to_cycles_conversion_rate"]
pub fn get_icp_to_cycles_conversion_rate() {
    over_async(candid, |()| get_icp_to_cycles_conversion_rate_impl());
}

async fn get_icp_to_cycles_conversion_rate_impl() -> u64 {
    #[cfg(feature = "mock_conversion_rate")]
    {
        100_000_000_000_000 // Assume a conversion rate of 100T cycles per 1 ICP.
    }

    #[cfg(not(feature = "mock_conversion_rate"))]
    {
        const CYCLES_PER_XDR: u64 = 1_000_000_000_000;

        let xdr_permyriad_per_icp =
            match ic_nns_common::registry::get_icp_xdr_conversion_rate_record().await {
                None => panic!("ICP/XDR conversion rate is not available."),
                Some((rate_record, _)) => rate_record.xdr_permyriad_per_icp,
            };

        xdr_permyriad_per_icp * (CYCLES_PER_XDR / 10_000)
    }
}

#[export_name = "canister_query get_stats"]
pub fn get_stats() {
    over(candid, |()| get_stats_impl());
}

fn get_stats_impl() -> Stats {
    let store = &STATE.read().unwrap().accounts_store;
    store.get_stats()
}

#[export_name = "canister_heartbeat"]
pub fn canister_heartbeat() {
    let future = run_periodic_tasks();

    dfn_core::api::futures::spawn(future);
}

#[derive(CandidType)]
pub enum GetAccountResponse {
    Ok(AccountDetails),
    AccountNotFound,
}
