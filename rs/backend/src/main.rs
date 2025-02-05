use crate::accounts_store::histogram::AccountsStoreHistogram;
use crate::accounts_store::{
    AccountDetails, AttachCanisterRequest, AttachCanisterResponse, CreateSubAccountResponse, DetachCanisterRequest,
    DetachCanisterResponse, GetImportedTokensResponse, ImportedTokens, NamedCanister, RegisterHardwareWalletRequest,
    RegisterHardwareWalletResponse, RenameCanisterRequest, RenameCanisterResponse, RenameSubAccountRequest,
    RenameSubAccountResponse, SetImportedTokensResponse,
};
use crate::arguments::{set_canister_arguments, CanisterArguments};
use crate::assets::{hash_bytes, insert_asset, Asset};
use crate::perf::PerformanceCount;
use crate::state::{init_state, restore_state, save_state, with_state, with_state_mut, StableState};
use crate::tvl::TvlResponse;

pub use candid::{CandidType, Deserialize};
use ic_cdk::println;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use icp_ledger::AccountIdentifier;
pub use serde::Serialize;

use ic_base_types::PrincipalId;

mod accounts_store;
mod arguments;
mod assets;
mod canisters;
mod constants;
mod metrics_encoder;
mod multi_part_transactions_processor;
mod perf;
mod spawn;
mod state;
mod stats;
mod time;
mod timer;
mod tvl;

#[init]
fn init(args: Option<CanisterArguments>) {
    println!("START init with args: {args:#?}");
    // Saving the instruction counter now will not have the desired effect
    // as the storage is about to be wiped out and replaced with stable memory.
    let counter_before = PerformanceCount::new("init start");
    init_state();
    perf::save_instruction_count(counter_before);
    set_canister_arguments(args);
    perf::record_instruction_count("init after set_canister_arguments");
    // Legacy:
    assets::init_assets();
    tvl::init_timers();
    perf::record_instruction_count("init stop");
    println!("END   init with args");
}

/// Redundant function, never called but required as this is `main.rs`.
fn main() {}

#[pre_upgrade]
fn pre_upgrade() {
    println!(
        "pre_upgrade instruction_counter before saving state: {} stable_memory_size_gib: {} wasm_memory_size_gib: {}",
        ic_cdk::api::instruction_counter(),
        stats::gibibytes(stats::stable_memory_size_bytes()),
        stats::gibibytes(stats::wasm_memory_size_bytes())
    );
    save_state();
    println!(
        "pre_upgrade instruction_counter after saving state: {} stable_memory_size_gib: {} wasm_memory_size_gib: {}",
        ic_cdk::api::instruction_counter(),
        stats::gibibytes(stats::stable_memory_size_bytes()),
        stats::gibibytes(stats::wasm_memory_size_bytes())
    );
}

#[post_upgrade]
fn post_upgrade(args_maybe: Option<CanisterArguments>) {
    println!("START post_upgrade with args: {args_maybe:#?}");
    // Saving the instruction counter now will not have the desired effect
    // as the storage is about to be wiped out and replaced with stable memory.
    let counter_before = PerformanceCount::new("post_upgrade start");
    restore_state();
    perf::save_instruction_count(counter_before);
    perf::record_instruction_count("post_upgrade after state_recovery");
    set_canister_arguments(args_maybe);
    perf::record_instruction_count("post_upgrade after set_canister_arguments");
    assets::init_assets();
    tvl::init_timers();
    perf::record_instruction_count("post_upgrade stop");
    println!("END   post-upgrade");
}

#[must_use]
#[ic_cdk::query]
pub fn http_request(req: assets::HttpRequest) -> assets::HttpResponse {
    assets::http_request(req)
}

fn get_caller() -> PrincipalId {
    ic_cdk::api::caller().into()
}

/// Returns the user's account details if they have an account, else `AccountNotFound`.
///
/// The account details contain each of the `AccountIdentifier`s linked to the user's account. These
/// include all accounts controlled by the user's principal directly and also any hardware wallet
/// accounts they have registered.
#[must_use]
#[ic_cdk::query]
pub fn get_account() -> GetAccountResponse {
    let principal = get_caller();
    with_state(|s| match s.accounts_store.get_account(principal) {
        Some(account) => GetAccountResponse::Ok(account),
        None => GetAccountResponse::AccountNotFound,
    })
}

/// Creates a new account controlled by the caller's principal.
///
/// Returns true if the account was created, else false (which happens if the principal already has
/// an account).
#[must_use]
#[ic_cdk::update]
pub fn add_account() -> AccountIdentifier {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.add_account(principal));
    AccountIdentifier::from(principal)
}

/// Creates a new ledger sub account and links it to the user's account.
///
/// This newly created account can be used to send and receive ICP and is controlled only by the
/// user's principal (the fact that it is controlled by the same principal as the user's other
/// ledger accounts is not derivable externally).
#[must_use]
#[ic_cdk::update]
pub fn create_sub_account(sub_account_name: String) -> CreateSubAccountResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.create_sub_account(principal, sub_account_name))
}

/// Changes the alias given to the chosen sub account.
///
/// These aliases are not visible externally or to anyone else.
#[must_use]
#[ic_cdk::update]
pub fn rename_sub_account(request: RenameSubAccountRequest) -> RenameSubAccountResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.rename_sub_account(principal, request))
}

/// Links a hardware wallet to the user's account.
///
/// A single hardware wallet can be linked to multiple user accounts, but in order to make calls to
/// the IC from the account, the user must use the hardware wallet to sign each request.
/// Some read-only calls do not require signing, e.g. viewing the account's ICP balance.
#[must_use]
#[ic_cdk::update]
pub fn register_hardware_wallet(request: RegisterHardwareWalletRequest) -> RegisterHardwareWalletResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.register_hardware_wallet(principal, request))
}

/// Returns the list of canisters which the user has attached to their account.
#[must_use]
#[ic_cdk::query]
pub fn get_canisters() -> Vec<NamedCanister> {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.get_canisters(principal))
}

/// Attaches a canister to the user's account.
#[must_use]
#[ic_cdk::update]
pub fn attach_canister(request: AttachCanisterRequest) -> AttachCanisterResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.attach_canister(principal, request))
}

/// Renames a canister of the user.
#[must_use]
#[ic_cdk::update]
pub fn rename_canister(request: RenameCanisterRequest) -> RenameCanisterResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.rename_canister(principal, request))
}

/// Detaches a canister from the user's account.
#[must_use]
#[ic_cdk::update]
pub fn detach_canister(request: DetachCanisterRequest) -> DetachCanisterResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.detach_canister(principal, request))
}

#[must_use]
#[ic_cdk::update]
pub fn set_imported_tokens(settings: ImportedTokens) -> SetImportedTokensResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.set_imported_tokens(principal, settings))
}

#[must_use]
#[ic_cdk::query]
pub fn get_imported_tokens() -> GetImportedTokensResponse {
    let principal = get_caller();
    with_state_mut(|s| s.accounts_store.get_imported_tokens(principal))
}

#[ic_cdk::update]
pub async fn get_proposal_payload(proposal_id: u64) -> Result<proposals::Json, String> {
    proposals::get_proposal_payload(proposal_id).await
}

/// Returns stats about the canister.
///
/// These stats include things such as the number of accounts registered, the memory usage, the
/// number of neurons created, etc.
#[must_use]
#[ic_cdk::query]
pub fn get_stats() -> stats::Stats {
    with_state(stats::get_stats)
}

/// Makes a histogram of the number of sub-accounts etc per account.
///
/// This is to be able to design an efficient account store.
///
/// Note: This is expensive to compute, as it scans across all
/// accounts, so this is not included in the general stats above.
#[must_use]
#[ic_cdk::query]
pub fn get_histogram() -> AccountsStoreHistogram {
    // The API is intended for ad-hoc analysis only and may be discontinued at any time.
    // - Other canisters should not rely on the method being available.
    // - Users should make query calls.
    let is_query_call = ic_cdk::api::data_certificate().is_some();
    if !is_query_call {
        ic_cdk::api::trap("Sorry, the histogram is available only as a query call.");
    }
    // Gets the histogram:
    with_state(|state| state.accounts_store.get_histogram())
}

/// Add an asset to be served by the canister.
///
/// Only a whitelist of assets are accepted.
#[ic_cdk::update]
pub fn add_stable_asset(asset_bytes: Vec<u8>) {
    let hash_bytes = hash_bytes(&asset_bytes);
    match hex::encode(hash_bytes).as_str() {
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
            ic_cdk::api::trap(&format!("Unknown asset with hash {unknown_hash}"));
        }
    }
}

/// Generates a lot of toy accounts for testing.
///
/// # Returns
/// The first account index created by this call.
///
/// E.g. if there are already 5 accounts and this call creates 10 accounts, then
/// 5 is returned.  If the call is repeated, then the returned value will be 15.
///
/// # Panics
/// - If the requested number of accounts is too large, the call will run out of cycles and be killed.
#[cfg(any(test, feature = "toy_data_gen"))]
#[must_use]
#[ic_cdk::update]
pub fn create_toy_accounts(num_accounts: u128) -> u64 {
    let caller = ic_cdk::caller();
    if !ic_cdk::api::is_controller(&caller) {
        ic_cdk::api::trap("Only the controller may generate toy accounts");
    }
    with_state_mut(|s| {
        s.accounts_store
            .create_toy_accounts(u64::try_from(num_accounts).unwrap_or_else(|_| {
                unreachable!("The number of accounts is well below the number of atoms in the universe")
            }))
    })
}

/// Gets any toy account by toy account index.
#[cfg(any(test, feature = "toy_data_gen"))]
#[must_use]
#[ic_cdk::query]
pub fn get_toy_account(toy_account_index: u64) -> GetAccountResponse {
    let caller = ic_cdk::caller();
    if !ic_cdk::api::is_controller(&caller) {
        ic_cdk::api::trap("Only the controller may access toy accounts");
    }
    let principal = PrincipalId::new_user_test_id(toy_account_index);
    with_state(|s| match s.accounts_store.get_account(principal) {
        Some(account) => GetAccountResponse::Ok(account),
        None => GetAccountResponse::AccountNotFound,
    })
}

#[must_use]
#[ic_cdk::query]
pub fn get_tvl() -> TvlResponse {
    tvl::get_tvl()
}

#[derive(CandidType)]
pub enum GetAccountResponse {
    Ok(AccountDetails),
    AccountNotFound,
}

// This has to be at the end of the file for the test to be able to find all
// the candid methods.
#[cfg(test)]
mod candid_interface_test;
