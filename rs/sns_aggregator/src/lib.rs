//! Entry points for the caching canister.
#![warn(missing_docs)]
#![warn(clippy::missing_docs_in_private_items)]
#![deny(clippy::panic)]
#![deny(clippy::expect_used)]
#![deny(clippy::unwrap_used)]
pub mod assets;
mod conversion;
mod state;
mod types;
mod upstream;

mod fast_scheduler;

use std::collections::VecDeque;
use std::time::Duration;

use assets::{insert_favicon, insert_home_page, AssetHashes, HttpRequest, HttpResponse};
use candid::{candid_method, export_service};
use fast_scheduler::FastScheduler;
use ic_cdk::api::call::{self};
use ic_cdk_timers::{set_timer, set_timer_interval};
use state::{Config, StableState, STATE};
use types::Icrc1Value;

/// API method for basic health checks.
///
/// TODO: Provide useful metrics at http://${canister_domain}/metrics
#[candid_method(query)]
#[ic_cdk_macros::query]
fn health_check() -> String {
    STATE.with(|state| {
        let last_partial_update = state.stable.borrow().sns_cache.borrow().last_partial_update / 1000000000;
        let last_update = state.stable.borrow().sns_cache.borrow().last_update / 1000000000;
        let num_to_get = state.stable.borrow().sns_cache.borrow().sns_to_get.len();
        let num_sns = state.stable.borrow().sns_cache.borrow().all_sns.len();
        // An optional name that may be defined during compilation to force upgrades by changing
        // the wasm.  This also allows the developer to verify that their release has been deployed
        // without looking up the wasm hash.
        let release_name = option_env!("RELEASE_NAME").unwrap_or("Squirrel");
        format!("Hello from {release_name}.  The last partial update was at: {last_partial_update}.  Last update cycle started at {last_update} with {num_to_get}/{num_sns} outstanding.")
    })
}

/// API method to get cycle balance and burn rate.
#[candid_method(update)]
#[ic_cdk_macros::update]
#[allow(clippy::panic)] // This is a readonly function, only a rather arcane reason prevents it from being a query call.
async fn get_canister_status() -> ic_ic00_types::CanisterStatusResultV2 {
    let own_canister_id = dfn_core::api::id();
    let result = ic_nervous_system_common::get_canister_status(own_canister_id.get()).await;
    result.unwrap_or_else(|err| panic!("Couldn't get canister_status of {}. Err: {:#?}", own_canister_id, err))
}

/// API method to get the current config
#[candid_method(query)]
#[ic_cdk_macros::query]
#[allow(clippy::expect_used)] // This is a query call, no real damage can ensue to this canister.
fn get_canister_config() -> Config {
    STATE.with(|state| state.stable.borrow().config.borrow().clone())
}

/// API method to dump stable data, preserved across upgrades, as JSON.
#[candid_method(query)]
#[ic_cdk_macros::query]
#[allow(clippy::expect_used)] // This is a query call, no real damage can ensue to this canister.
fn stable_data() -> String {
    STATE.with(|state| {
        let to_serialize: &StableState = &state.stable.borrow();
        serde_json::to_string(to_serialize).expect("Failed to serialize")
    })
}

/// Get most recent log data
#[candid_method(query)]
#[ic_cdk_macros::query]
fn tail_log(limit: Option<u16>) -> String {
    let limit = limit.unwrap_or(200) as usize;
    STATE.with(|state| {
        let to_serialize: &VecDeque<String> = &state.log.borrow();
        to_serialize
            .iter()
            .rev()
            .take(limit)
            .rev()
            .cloned()
            .collect::<Vec<_>>()
            .join("\n")
    })
}

/// Web server
#[candid_method(query)]
#[export_name = "canister_query http_request"]
fn http_request(/* req: HttpRequest */) /* -> HttpResponse */
{
    ic_cdk::setup();
    let request = call::arg_data::<(HttpRequest,)>().0;
    let response = match request.url.as_ref() {
        "/__candid" => HttpResponse::from(__export_service()),
        _ => assets::http_request(request),
    };
    call::reply((response,));
}

/// Function called when a canister is first created IF it is created
/// with this code.
///
/// Note: If the canister os created with e.g. `dfx canister create`
///       and then `dfx deploy`, `init(..)` is never called.
#[ic_cdk_macros::init]
#[candid_method(init)]
fn init(config: Option<Config>) {
    crate::state::log("Calling init...".to_string());
    setup(config);
}

/// Function called before upgrade to a new wasm.
#[ic_cdk_macros::pre_upgrade]
fn pre_upgrade() {
    // Make an effort to save state.  If it doesn't work, it doesn't matter much
    // as the data will be fetched from upstream anew.  There will be a period in
    // which the data is unavailable but that will pass.
    //
    // Note: Serializing the data is problematic as not all types support Candid
    //       serialization and not all support Serde.  At present the best choice
    //       seems to be to serialize with Serde, omitting asset hashes which can
    //       be serialized with neither.
    STATE.with(|state| {
        let to_serialize: &StableState = &state.stable.borrow();
        if let Ok(bytes) = to_serialize.to_bytes() {
            let bytes_summary = StableState::summarize_bytes(&bytes);
            match ic_cdk::storage::stable_save((bytes,)) {
                Ok(_) => crate::state::log(format!("Saved state as {bytes_summary}")),
                Err(err) => crate::state::log(format!("Failed to save state: {err:?}")),
            }
        }
    });
}

/// Function called after a canister has been upgraded to a new wasm.
#[ic_cdk_macros::post_upgrade]
fn post_upgrade(config: Option<Config>) {
    crate::state::log("Calling post_upgrade...".to_string());
    // Make an effort to restore state.  If it doesn't work, give up.
    STATE.with(|state| {
        match ic_cdk::storage::stable_restore()
            .map_err(|err| format!("Failed to retrieve stable memory: {err}"))
            .and_then(|(bytes,): (Vec<u8>,)| StableState::from_bytes(&bytes))
        {
            Ok(data) => {
                *state.asset_hashes.borrow_mut() = AssetHashes::from(&*data.assets.borrow());
                *state.stable.borrow_mut() = data;
                crate::state::log("Successfully restored stable memory.".to_string());
            }
            Err(message) => {
                crate::state::log(message);
            }
        }
    });
    setup(config);
}

/// Method to allow reconfiguration without a wasm change.
///
/// Note: This _could_ be exposed in production if limited to the controllers
///  - Controllers can be obtained by the async call: agent.read_state_canister_info(canister_id, "controllers")
#[cfg(feature = "reconfigurable")]
#[ic_cdk_macros::update]
#[candid_method(update)]
fn reconfigure(config: Option<Config>) {
    setup(config);
}

/// Code that needs to be run on init and after every upgrade.
fn setup(config: Option<Config>) {
    // Note: This is intentionally highly visible in logs.
    crate::state::log(format!(
        "\n\
        ///////////////////////////\n\
        // R E C O N F I G U R E //\n\
        ///////////////////////////\n\
        // New configuration:
        {config:#?}\n\
        ///////////////////////////\n"
    ));
    // Set configuration, if provided
    if let Some(config) = config {
        crate::state::log(format!("Setting config to: {:?}", &config));
        STATE.with(|state| {
            *state.stable.borrow().config.borrow_mut() = config;
        });
    } else {
        crate::state::log("Using existing config.".to_string());
    }
    // Browsers complain if they don't get pretty pictures.  So do I.
    insert_favicon();
    insert_home_page();

    // Schedules data collection from the SNSs.
    //
    // Note: In future we are likely to want to make the duration dynamic and
    //       have an altogether more complicated data collection schedule.
    //
    // Note: Timers are lost on upgrade, so a fresh timer needs to be started after upgrade.
    let timer_interval = Duration::from_millis(STATE.with(|s| s.stable.borrow().config.borrow().update_interval_ms));
    crate::state::log(format!("Set interval to {}", &timer_interval.as_millis()));
    STATE.with(|state| {
        let timer_id = set_timer_interval(timer_interval, || ic_cdk::spawn(crate::upstream::update_cache()));
        let old_timer = state.timer_id.replace_with(|_| Some(timer_id));
        if let Some(id) = old_timer {
            ic_cdk_timers::clear_timer(id);
        }
    });
    // Schedule fast collection of swap state
    FastScheduler::global_start();
    // Get one SNS quickly, so that we don't need to wait for the normal, slow schedule before
    // there is some sign of life.
    //
    // We schedule two calls, one to get a list of SNSs, one to get an SNS from the list.
    // Getting a list of SNSs typically takes two block heights, so a 4 second delay between
    // the calls will cover all but the most extremely slow networks.
    for i in 0..2 {
        set_timer(Duration::from_secs(i * 4), || {
            ic_cdk::spawn(crate::upstream::update_cache())
        });
    }
}

// Collects all the API method signatures for export as a candid interface definition.
//
// Note: This MUST come after all the API methods.
export_service!();

/// Returns candid describing the interface.
#[ic_cdk_macros::query]
fn interface() -> String {
    __export_service()
}
