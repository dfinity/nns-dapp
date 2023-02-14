//! Entry points for the caching canister.
#![warn(missing_docs)]
#![warn(clippy::missing_docs_in_private_items)]
pub mod assets;
mod conversion;
mod state;
mod types;
mod upstream;

#[cfg(test)]
mod tests;

use std::time::Duration;

use assets::{insert_favicon, insert_home_page, AssetHashes, HttpRequest, HttpResponse};
use candid::{candid_method, export_service};
use ic_cdk::api::call::{self};
use ic_cdk::timer::{set_timer, set_timer_interval};
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

/// API method to dump stable data, preserved across upgrades, as JSON.
#[candid_method(query)]
#[ic_cdk_macros::query]
fn stable_data() -> String {
    STATE.with(|state| {
        let to_serialize: &StableState = &(*state.stable.borrow());
        serde_json::to_string(to_serialize).expect("Failed to serialize")
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
#[deny(clippy::panic)] // Panicking during upgrade is bad.
#[ic_cdk_macros::init]
#[candid_method(init)]
fn init(config: Option<Config>) {
    ic_cdk::api::print("Calling init...");
    setup(config);
}

/// Function called before upgrade to a new wasm.
#[deny(clippy::panic)] // Panicking during upgrade is bad.
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
        let to_serialize: &StableState = &(*state.stable.borrow());
        if let Ok(bytes) = to_serialize.to_bytes() {
            let bytes_summary = StableState::summarize_bytes(&bytes);
            match ic_cdk::storage::stable_save((bytes,)) {
                Ok(_) => ic_cdk::api::print(format!("Saved state as {bytes_summary}")),
                Err(err) => ic_cdk::api::print(format!("Failed to save state: {err:?}")),
            }
        }
    });
}

/// Function called after a canister has been upgraded to a new wasm.
#[deny(clippy::panic)] // Panicking during upgrade is bad.
#[ic_cdk_macros::post_upgrade]
fn post_upgrade(config: Option<Config>) {
    ic_cdk::api::print("Calling post_upgrade...");
    // Make an effort to restore state.  If it doesn't work, give up.
    STATE.with(|state| {
        match ic_cdk::storage::stable_restore()
            .map_err(|err| format!("Failed to retrieve stable memory: {err}"))
            .and_then(|(bytes,): (Vec<u8>,)| StableState::from_bytes(&bytes))
        {
            Ok(data) => {
                *state.asset_hashes.borrow_mut() = AssetHashes::from(&*data.assets.borrow());
                *state.stable.borrow_mut() = data;
            }
            Err(message) => {
                ic_cdk::api::print(message);
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
    ic_cdk::api::print(format!(
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
        ic_cdk::api::print(format!("Setting config to: {:?}", &config));
        STATE.with(|state| {
            *state.stable.borrow().config.borrow_mut() = config;
        });
    } else {
        ic_cdk::api::print("Using existing config.");
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
    ic_cdk::api::print(format!("Set interval to {}", &timer_interval.as_millis()));
    STATE.with(|state| {
        let timer_id = set_timer_interval(timer_interval, || ic_cdk::spawn(crate::upstream::update_cache()));
        let old_timer = state.timer_id.replace_with(|_| Some(timer_id));
        if let Some(id) = old_timer {
            ic_cdk::timer::clear_timer(id);
        }
    });
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
