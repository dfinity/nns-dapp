use crate::accounts_store::{
    AccountDetails, AddPendingNotifySwapRequest, AddPendingTransactionResponse, AttachCanisterRequest,
    AttachCanisterResponse, CreateSubAccountResponse, DetachCanisterRequest, DetachCanisterResponse,
    GetTransactionsRequest, GetTransactionsResponse, NamedCanister, RegisterHardwareWalletRequest,
    RegisterHardwareWalletResponse, RenameSubAccountRequest, RenameSubAccountResponse, Stats, TransactionType,
};
use crate::assets::{hash_bytes, insert_asset, Asset};
use crate::periodic_tasks_runner::run_periodic_tasks;
use crate::state::{StableState, State, STATE};
use candid::CandidType;
use dfn_candid::{candid, candid_one};
use dfn_core::{api::trap_with, over, over_async, stable};
use icp_ledger::AccountIdentifier;

mod accounts_store;
mod assets;
mod canisters;
mod constants;
mod ledger_sync;
mod metrics_encoder;
mod multi_part_transactions_processor;
mod periodic_tasks_runner;
mod proposals;
mod state;
mod time;
mod perf;

type Cycles = u128;

#[export_name = "canister_init"]
fn main() {
    assets::init_assets();
}

#[export_name = "canister_pre_upgrade"]
fn pre_upgrade() {
    perf::record_instruction_counter("pre_upgrade start");
    STATE.with(|s| {
        let bytes = s.encode();
        stable::set(&bytes);
    });
    // Note:  To see the instruction counter after pre-upgrade, see post-upgrade.
    //        Until stable memory has been restored more measurement scannot be saved.
}

#[export_name = "canister_post_upgrade"]
fn post_upgrade() {
    // Saving the instruction counter now will not have the desired effect
    // as the storage is about to be wiped out and replaced with stable memory.
    let counter_before = perf::PerformanceCounter::new("post_upgrade start");
    STATE.with(|s| {
        let bytes = stable::get();
        let new_state = State::decode(bytes).unwrap_or_else(|e| {
            trap_with(&format!("Decoding stable memory failed. Error: {:?}", e));
            unreachable!();
        });

        s.replace(new_state);
    });

    perf::save_instruction_counter(counter_before);
    perf::record_instruction_counter("post_upgrade after state_recovery");
    assets::init_assets();
    perf::record_instruction_counter("post_upgrade after init_assets");
    perf::record_instruction_counter("post_upgrade stop");
}

#[export_name = "canister_query http_request"]
pub fn http_request() {
    over(candid_one, assets::http_request);
}

/// Returns the user's account details if they have an account, else AccountNotFound.
///
/// The account details contain each of the AccountIdentifiers linked to the user's account. These
/// include all accounts controlled by the user's principal directly and also any hardware wallet
/// accounts they have registered.
#[export_name = "canister_query get_account"]
pub fn get_account() {
    over(candid, |()| get_account_impl());
}

fn get_account_impl() -> GetAccountResponse {
    let principal = dfn_core::api::caller();
    STATE.with(|s| match s.accounts_store.borrow().get_account(principal) {
        Some(account) => GetAccountResponse::Ok(account),
        None => GetAccountResponse::AccountNotFound,
    })
}

/// Creates a new account controlled by the caller's principal.
///
/// Returns true if the account was created, else false (which happens if the principal already has
/// an account).
#[export_name = "canister_update add_account"]
fn add_account() {
    over(candid, |()| add_account_impl());
}

fn add_account_impl() -> AccountIdentifier {
    let principal = dfn_core::api::caller();
    STATE.with(|s| s.accounts_store.borrow_mut().add_account(principal));
    AccountIdentifier::from(principal)
}

/// Returns a page of transactions for a given AccountIdentifier.
///
/// The AccountIdentifier must be linked to the caller's account, else an empty Vec will be
/// returned.
#[export_name = "canister_query get_transactions"]
pub fn get_transactions() {
    over(candid_one, get_transactions_impl);
}

fn get_transactions_impl(request: GetTransactionsRequest) -> GetTransactionsResponse {
    let principal = dfn_core::api::caller();
    STATE.with(|s| s.accounts_store.borrow().get_transactions(principal, request))
}

/// Creates a new ledger sub account and links it to the user's account.
///
/// This newly created account can be used to send and receive ICP and is controlled only by the
/// user's principal (the fact that it is controlled by the same principal as the user's other
/// ledger accounts is not derivable externally).
#[export_name = "canister_update create_sub_account"]
pub fn create_sub_account() {
    over(candid_one, create_sub_account_impl);
}

fn create_sub_account_impl(sub_account_name: String) -> CreateSubAccountResponse {
    let principal = dfn_core::api::caller();
    STATE.with(|s| {
        s.accounts_store
            .borrow_mut()
            .create_sub_account(principal, sub_account_name)
    })
}

/// Changes the alias given to the chosen sub account.
///
/// These aliases are not visible externally or to anyone else.
#[export_name = "canister_update rename_sub_account"]
pub fn rename_sub_account() {
    over(candid_one, rename_sub_account_impl);
}

fn rename_sub_account_impl(request: RenameSubAccountRequest) -> RenameSubAccountResponse {
    let principal = dfn_core::api::caller();
    STATE.with(|s| s.accounts_store.borrow_mut().rename_sub_account(principal, request))
}

/// Links a hardware wallet to the user's account.
///
/// A single hardware wallet can be linked to multiple user accounts, but in order to make calls to
/// the IC from the account, the user must use the hardware wallet to sign each request.
/// Some readonly calls do not require signing, eg. viewing the account's ICP balance.
#[export_name = "canister_update register_hardware_wallet"]
pub fn register_hardware_wallet() {
    over(candid_one, register_hardware_wallet_impl);
}

fn register_hardware_wallet_impl(request: RegisterHardwareWalletRequest) -> RegisterHardwareWalletResponse {
    let principal = dfn_core::api::caller();
    STATE.with(|s| {
        s.accounts_store
            .borrow_mut()
            .register_hardware_wallet(principal, request)
    })
}

/// Returns the list of canisters which the user has attached to their account.
#[export_name = "canister_query get_canisters"]
pub fn get_canisters() {
    over(candid, |()| get_canisters_impl());
}

fn get_canisters_impl() -> Vec<NamedCanister> {
    let principal = dfn_core::api::caller();
    STATE.with(|s| s.accounts_store.borrow_mut().get_canisters(principal))
}

/// Attaches a canister to the user's account.
#[export_name = "canister_update attach_canister"]
pub fn attach_canister() {
    over(candid_one, attach_canister_impl);
}

fn attach_canister_impl(request: AttachCanisterRequest) -> AttachCanisterResponse {
    let principal = dfn_core::api::caller();
    STATE.with(|s| s.accounts_store.borrow_mut().attach_canister(principal, request))
}

/// Detaches a canister from the user's account.
#[export_name = "canister_update detach_canister"]
pub fn detach_canister() {
    over(candid_one, detach_canister_impl);
}

fn detach_canister_impl(request: DetachCanisterRequest) -> DetachCanisterResponse {
    let principal = dfn_core::api::caller();
    STATE.with(|s| s.accounts_store.borrow_mut().detach_canister(principal, request))
}

#[export_name = "canister_update get_proposal_payload"]
pub fn get_proposal_payload() {
    over_async(candid_one, proposals::get_proposal_payload)
}

#[export_name = "canister_update add_pending_notify_swap"]
pub fn add_pending_notify_swap() {
    over(candid_one, add_pending_notify_swap_impl);
}

fn add_pending_notify_swap_impl(request: AddPendingNotifySwapRequest) -> AddPendingTransactionResponse {
    let caller = dfn_core::api::caller();
    STATE.with(|s| {
        if s.accounts_store
            .borrow_mut()
            .check_pending_transaction_buyer(caller, request.buyer)
        {
            s.accounts_store.borrow_mut().add_pending_transaction(
                AccountIdentifier::new(request.buyer, request.buyer_sub_account),
                AccountIdentifier::new(request.swap_canister_id.get(), Some((&request.buyer).into())),
                TransactionType::ParticipateSwap(request.swap_canister_id),
            )
        } else {
            AddPendingTransactionResponse::NotAuthorized
        }
    })
}

/// Returns stats about the canister.
///
/// These stats include things such as the number of accounts registered, the memory usage, the
/// number of neurons created, etc.
#[export_name = "canister_query get_stats"]
pub fn get_stats() {
    over(candid, |()| get_stats_impl());
}

fn get_stats_impl() -> Stats {
    STATE.with(|s| s.accounts_store.borrow().get_stats())
}

/// Executes on every block height and is used to run background processes.
///
/// These background processes include:
/// - Sync transactions from the ledger
/// - Process any queued 'multi-part' actions (eg. staking a neuron or topping up a canister)
/// - Prune old transactions if memory usage is too high
#[export_name = "canister_heartbeat"]
pub fn canister_heartbeat() {
    let future = run_periodic_tasks();

    dfn_core::api::futures::spawn(future);
}

/// Add an asset to be served by the canister.
///
/// Only a whitelist of assets are accepted.
#[export_name = "canister_update add_stable_asset"]
pub fn add_stable_asset() {
    over(candid_one, |asset_bytes: Vec<u8>| {
        let hash_bytes = hash_bytes(&asset_bytes);
        match hex::encode(&hash_bytes).as_str() {
            "933c135529499e2ed6b911feb8e8824068dc545298b61b93ae813358b306e7a6" => {
                // Canvaskit wasm.
                insert_asset(
                    "/assets/canvaskit/canvaskit.wasm",
                    Asset::new_stable(asset_bytes)
                        .with_header("content-type", "application/wasm")
                        .with_header("content-encoding", "gzip"),
                );
            }
            "12729155ff56fce7be6bb93ab2666c99fd7ff844e6c4611d144808c942b50748" => {
                // Canvaskit.js
                insert_asset("/assets/canvaskit/canvaskit.js", Asset::new_stable(asset_bytes));
            }
            unknown_hash => {
                dfn_core::api::trap_with(&format!("Unknown asset with hash {}", unknown_hash));
            }
        }
    })
}

#[derive(CandidType)]
pub enum GetAccountResponse {
    Ok(AccountDetails),
    AccountNotFound,
}
