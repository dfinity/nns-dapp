//! Entry points for the caching canister.
pub mod assets;
mod conversion;
mod state;
mod types;
mod upstream;

use assets::{insert_favicon, HttpRequest};
use ic_cdk::api::call::{self};
use state::STATE;
use types::Icrc1Value;

/// API method for basic health checks.
#[ic_cdk_macros::query]
fn greet(name: String) -> String {
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

/// Periodic function call responsible for populating the cache
#[ic_cdk_macros::heartbeat]
async fn heartbeat() {
    crate::upstream::update_cache().await;
}

#[ic_cdk_macros::post_upgrade]
fn post_upgrade() {
    insert_favicon();
}

#[ic_cdk_macros::init]
fn init() {
    insert_favicon();
}
