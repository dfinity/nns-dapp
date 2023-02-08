//! Entry points for the caching canister.
#![warn(missing_docs)]
#![warn(clippy::missing_docs_in_private_items)]
pub mod assets;
mod conversion;
mod state;
mod types;
mod upstream;

use std::time::Duration;

use assets::{insert_favicon, HttpRequest};
use ic_cdk::api::call::{self};
use ic_cdk::timer::set_timer_interval;
use state::STATE;
use types::Icrc1Value;

/// API method for basic health checks.
///
/// TODO: Provide useful metrics at http://${canister_domain}/metrics
#[ic_cdk_macros::query]
fn health_check(name: String) -> String {
    STATE.with(|state| {
        let last_partial_update = state.sns_aggregator.borrow().last_partial_update;
        let last_update = state.sns_aggregator.borrow().last_update;
        let num_to_get = state.sns_aggregator.borrow().sns_to_get.len();
        format!("Hello, {name}!  The last partial update was at: {last_partial_update}.  Last update cycle started at {last_update} with {num_to_get} outstanding.")
    })
}

/// Web server
#[export_name = "canister_query http_request"]
fn http_request(/* req: HttpRequest */) /* -> HttpResponse */
{
    ic_cdk::setup();
    let request = call::arg_data::<(HttpRequest,)>().0;
    let response = assets::http_request(request);
    call::reply((response,));
}

/// Function called when a canister is first created IF it is created
/// with this code.
///
/// Note: If the canister os created with e.g. `dfx canister create`
///       and then deployed normally, `init(..)` is never called.
#[ic_cdk_macros::init]
fn init() {
    insert_favicon();
}

/// Function called before upgrade to a new wasm.
#[ic_cdk_macros::post_upgrade]
fn post_upgrade() {
    // Browsers complain if they don't get pretty pictures.  So do I.
    insert_favicon();
    // Periodic function call responsible for populating and aggregating the cache.
    //
    // Note: In future we are likely to want to make the duration dynamic and
    //       have an altogether more complicated data collection schedule.
    set_timer_interval(
        Duration::from_secs(1),
        || ic_cdk::spawn(crate::upstream::update_cache()),
    );
}
