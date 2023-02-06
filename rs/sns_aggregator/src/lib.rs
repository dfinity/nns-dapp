//! Entry points for the caching canister.
#![warn(missing_docs)]
pub mod assets;
mod conversion;
mod state;
mod types;
mod upstream;

use std::time::Duration;

use assets::{insert_favicon, HttpRequest, HttpResponse};
use candid::{candid_method, export_service};
use ic_cdk::api::call::{self};
use ic_cdk::timer::set_timer_interval;
use state::{Config, STATE};
use types::Icrc1Value;

/// API method for basic health checks.
///
/// TODO: Provide useful metrics at http://${canister_domain}/metrics
#[ic_cdk_macros::query]
fn health_check() -> String {
    STATE.with(|state| {
        let last_partial_update = state.stable.borrow().sns_cache.borrow().last_partial_update / 1000000000;
        let last_update = state.stable.borrow().sns_cache.borrow().last_update / 1000000000;
        let num_to_get = state.stable.borrow().sns_cache.borrow().sns_to_get.len();
        let num_sns = state.stable.borrow().sns_cache.borrow().all_sns.len();
        format!("The last partial update was at: {last_partial_update}.  Last update cycle started at {last_update} with {num_to_get}/{num_sns} outstanding.")
    })
}

/// Web server
#[export_name = "canister_query http_request"]
#[candid_method(query)]
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

#[ic_cdk_macros::init]
#[candid_method(init)]
fn init(config: Option<Config>) {
    ic_cdk::api::print("Calling init...");
    setup(config);
}

#[ic_cdk_macros::pre_upgrade]
fn pre_upgrade() {
    // Make an effort to save state.  If it doesn't work, it doesn't matter much
    // as the data will be fetched from upstream anew.  There will be a period in
    // which the data is unavailable but that will pass.
    STATE.with(|state| {
        if let Ok(bytes) = serde_cbor::to_vec(&state.stable) {
            match ic_cdk::storage::stable_save((bytes,)) {
                Ok(_) => ic_cdk::api::print("Saved state"),
                Err(err) => ic_cdk::api::print(format!("Failed to save state: {err:?}")),
            }
        }
    });
}

#[ic_cdk_macros::post_upgrade]
fn post_upgrade(config: Option<Config>) {
    ic_cdk::api::print("Calling post_upgrade...");
    // Make an effort to restore state.  If it doesn't work, give up.
    STATE.with(|state| {
        if let Ok(data) = ic_cdk::storage::stable_restore()
            .map_err(|err| format!("Failed to retrieve stable memory: {err}"))
            .and_then(|(bytes,): (Vec<u8>,)| {
                serde_cbor::from_slice(&bytes[..]).map_err(|err| format!("Failed to parse stable memory: {err:?}"))
            })
        {
            *state.stable.borrow_mut() = data;
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
}

export_service!();
#[ic_cdk_macros::query]
fn interface() -> String {
    __export_service()
}
