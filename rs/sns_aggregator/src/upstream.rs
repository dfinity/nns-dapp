//! Functions that get data from upstream SNS and NNS canisters.
use std::str::FromStr;

use crate::convert_canister_id;
use crate::fast_scheduler::FastScheduler;
use crate::state::{State, STATE};
use crate::types::ic_sns_governance::{self as sns_gov, ListTopicsRequest, NervousSystemParameters};
use crate::types::ic_sns_swap::{
    GetDerivedStateResponse, GetInitResponse, GetLifecycleResponse, GetSaleParametersResponse,
};
use crate::types::ic_sns_wasm::{DeployedSns, ListDeployedSnsesResponse};
use crate::types::upstream::UpstreamData;
use crate::types::{self, EmptyRecord, GetMetricsRequest, GetStateResponse, Icrc1Value, SnsTokens};
use anyhow::anyhow;
use candid::Principal;
use candid::Principal as CanisterId;
use ic_cdk::api::time;
use ic_cdk::call::CallResult;
use serde::Serialize;

#[cfg(test)]
mod tests;

/// default time window to get SNS metrics is 2 months.
const TIME_WINDOW_SECONDS: u64 = 2 * 30 * 24 * 3600;

/// The largest JSON size, in bytes, that the aggregator accepts for each SNS controlled field.
///
/// An SNS controls the content of every field below.  The aggregator caches the fields.  It also
/// copies most of them into shared pages of ten SNSs.  The Internet Computer limits a reply to
/// about two megabytes, so one huge field can make a shared page too large to serve.
///
/// Each limit is at least three times the largest value that mainnet SNSs use today.  The source
/// is the mainnet snapshot in `frontend/src/tests/workflows/Launchpad/sns-agg-page-*.json`, taken
/// on 2026-08-28.  It holds 54 SNSs.  Each comment gives the observed maximum.  A limit that is
/// too low would empty a field of a real SNS, so each limit keeps a large margin.
pub mod limits {
    /// Canister IDs from the SNS root canister.  Mainnet maximum: 1106 bytes.
    /// The limit holds about 220 dapp canister IDs.
    pub const LIST_SNS_CANISTERS: usize = 16 * 1024;
    /// The project URL in the governance metadata.  Mainnet maximum: 48 bytes.
    pub const META_URL: usize = 4 * 1024;
    /// The project name in the governance metadata.  Mainnet maximum: 21 bytes.
    pub const META_NAME: usize = 4 * 1024;
    /// The project description in the governance metadata.  Mainnet maximum: 1534 bytes.
    pub const META_DESCRIPTION: usize = 16 * 1024;
    /// The project logo, as a data URL, in the governance metadata.
    ///
    /// The snapshot holds no governance logo, because the aggregator serves it as a separate
    /// asset.  The largest logo in the snapshot is the ledger logo, at 291585 bytes.  The limit
    /// gives that logo a margin of 1.8 times.
    pub const META_LOGO: usize = 512 * 1024;
    /// Governance metrics.  Mainnet maximum: 950 bytes.
    pub const METRICS: usize = 16 * 1024;
    /// The last voting reward event.  Mainnet maximum: 836 bytes.
    /// The limit holds about 900 settled proposal IDs in one reward round.
    pub const LATEST_REWARD_EVENT: usize = 16 * 1024;
    /// The nervous system functions.  Mainnet maximum: 43148 bytes, for 121 functions.
    pub const PARAMETERS: usize = 128 * 1024;
    /// The nervous system parameters.  Mainnet maximum: 1059 bytes.
    pub const NERVOUS_SYSTEM_PARAMETERS: usize = 16 * 1024;
    /// The swap state, after the aggregator removes the lists that it never serves.
    /// Mainnet maximum of the served part: 36958 bytes.
    pub const SWAP_STATE: usize = 128 * 1024;
    /// The ledger metadata.  Mainnet maximum: 291921 bytes.
    ///
    /// The token logo makes up almost all of that size.  The limit gives it a margin of 1.8
    /// times.  This is the largest field that reaches a shared page.
    pub const ICRC1_METADATA: usize = 512 * 1024;
    /// The ledger transaction fee.  Mainnet maximum: 22 bytes.
    /// A 128 bit number needs at most 39 digits.
    pub const ICRC1_FEE: usize = 128;
    /// The ledger total supply.  Mainnet maximum: 19 bytes.
    pub const ICRC1_TOTAL_SUPPLY: usize = 128;
    /// The swap parameters.  Mainnet maximum: 471 bytes.
    pub const SWAP_PARAMS: usize = 8 * 1024;
    /// The initialization parameters of the swap.  Mainnet maximum: 36294 bytes.
    pub const INIT: usize = 128 * 1024;
    /// The derived swap state.  Mainnet maximum: 258 bytes.
    pub const DERIVED_STATE: usize = 4 * 1024;
    /// The swap lifecycle.  Mainnet maximum: 138 bytes.
    pub const LIFECYCLE: usize = 4 * 1024;
    /// The governance topics.  Mainnet maximum: 44484 bytes.
    /// Topics repeat the nervous system functions, so this limit matches `PARAMETERS`.
    pub const TOPICS: usize = 128 * 1024;
}

/// Returns `value` if its JSON form fits in `max_bytes`, else an empty value and a reason.
///
/// An SNS controls the fields that the aggregator caches and serves.  A field that is too large
/// makes a shared page too large to serve, and it makes the cache grow without limit.  The
/// aggregator empties one field instead of dropping the whole SNS.  The SNS keeps its place in
/// the list, so the launchpad still shows it.
fn bound<T: Serialize + Default>(value: T, max_bytes: usize) -> (T, Option<String>) {
    match serde_json::to_vec(&value) {
        Ok(json) if json.len() <= max_bytes => (value, None),
        Ok(json) => {
            let size = json.len();
            (
                T::default(),
                Some(format!("has {size} bytes and the limit is {max_bytes} bytes")),
            )
        }
        Err(err) => (T::default(), Some(format!("cannot be measured: {err}"))),
    }
}

/// Applies `bound` and writes any reason to the canister log.
fn bounded<T: Serialize + Default>(index: u64, field: &str, value: T, max_bytes: usize) -> T {
    let (value, reason) = bound(value, max_bytes);
    if let Some(reason) = reason {
        crate::state::log(format!(
            "SNS index {index}: field '{field}' {reason}.  The aggregator empties the field."
        ));
    }
    value
}

/// Limits the size of each part of the governance metadata.
///
/// The logo is much larger than the other parts, and the aggregator serves it as a separate
/// asset.  Each part therefore gets its own limit.
fn bounded_metadata(index: u64, meta: types::GetMetadataResponse) -> types::GetMetadataResponse {
    types::GetMetadataResponse {
        url: bounded(index, "meta.url", meta.url, limits::META_URL),
        logo: bounded(index, "meta.logo", meta.logo, limits::META_LOGO),
        name: bounded(index, "meta.name", meta.name, limits::META_NAME),
        description: bounded(index, "meta.description", meta.description, limits::META_DESCRIPTION),
    }
}

/// Removes the parts of the swap state that the aggregator never serves.
///
/// The swap canister returns every buyer, every neuron recipe and every Neurons' Fund
/// participant.  The aggregator serves none of them.  These lists grow with the number of
/// participants, so the aggregator clears them before it caches the record.
fn strip_unserved_swap_state(mut swap_state: GetStateResponse) -> GetStateResponse {
    if let Some(swap) = swap_state.swap.as_mut() {
        swap.buyers = Vec::new();
        swap.neuron_recipes = Vec::new();
        swap.cf_participants = Vec::new();
    }
    swap_state
}

/// Updates one part of the cache:  Either the list of SNSs or one SNS.
// TODO: overlapping invocations could race on `sns_to_get.pop()` /
// `set_list_of_sns_to_get()`. Migrate to `set_timer_interval_serial` once we're
// comfortable with the API (added in ic-cdk-timers 1.0.0) to serialize ticks.
pub async fn update_cache() {
    crate::state::log("Getting upstream data...".to_string());
    let sns_maybe = STATE.with(|state| {
        state.stable.borrow().sns_cache.borrow_mut().last_partial_update = time();
        state.stable.borrow().sns_cache.borrow_mut().sns_to_get.pop()
    });
    crate::state::log("Maybe have SNSs".to_string());
    let result = if let Some((index, sns)) = sns_maybe {
        crate::state::log("Consumed an SNS".to_string());
        get_sns_data(index, sns).await
    } else {
        // Timestamp start of cycle
        STATE.with(|state| {
            state.stable.borrow().sns_cache.borrow_mut().last_update = time();
        });
        crate::state::log("Need to get more SNSs".to_string());
        set_list_of_sns_to_get().await
    };
    if let Err(err) = result {
        crate::state::log(format!("SNS update command failed with: {err}"));
    }
}

/// The NNS SNS Wasm canister ID
///
/// This canister contains a list of all SNS root canisters it has created.
#[allow(clippy::expect_used)]
fn nns_sns_wasm_canister_id() -> Principal {
    Principal::from_text("qaa6y-5yaaa-aaaaa-aaafa-cai").expect("I don't believe it's not a valid canister ID??!")
}

/// Gets a list of SNSs from the nns-sns-wasm canister and puts it in the queue of SNSs to query.
///
/// Note: We can improve on this by filtering out SNSs that have stopped changing.
async fn set_list_of_sns_to_get() -> anyhow::Result<()> {
    crate::state::log("Asking for more SNSs".to_string());
    let result: CallResult<(ListDeployedSnsesResponse,)> =
        ic_cdk::call::Call::unbounded_wait(nns_sns_wasm_canister_id(), "list_deployed_snses")
            .with_arg(EmptyRecord {})
            .await
            .map_err(ic_cdk::call::Error::from)
            .and_then(|resp| resp.candid_tuple::<(ListDeployedSnsesResponse,)>().map_err(Into::into));
    crate::state::log("Asked for more SNSs".to_string());
    match result {
        Err(err) => {
            let message = format!("{err}");
            crate::state::log(format!("Cache update failed: {message}"));
            Err(anyhow!("Cache update failed: {message}"))
        }
        Ok((stuff,)) => {
            crate::state::log(format!(
                "Yay, got {} SNSs: {}",
                stuff.instances.len(),
                serde_json::to_string(&stuff).unwrap_or_else(|_| "Could not serialise response".to_string())
            ));
            let instances: Vec<_> = (0..).zip(stuff.instances).collect();
            STATE.with(|state| {
                state
                    .stable
                    .borrow()
                    .sns_cache
                    .borrow_mut()
                    .all_sns
                    .clone_from(&instances);
                state
                    .stable
                    .borrow()
                    .sns_cache
                    .borrow_mut()
                    .sns_to_get
                    .clone_from(&instances);
            });
            Ok(())
        }
    }
}

/// Populates the cache with the data for an SNS.
#[allow(clippy::too_many_lines)] // Long but simple - we have ~ 6 lines per dataset that we need to collect.
async fn get_sns_data(index: u64, sns_canister_ids: DeployedSns) -> anyhow::Result<()> {
    crate::state::log(format!("Getting SNS index {index}..."));
    let swap_canister_id = convert_canister_id!(&sns_canister_ids.swap_canister_id);
    let root_canister_id = convert_canister_id!(&sns_canister_ids.root_canister_id);
    let governance_canister_id = convert_canister_id!(&sns_canister_ids.governance_canister_id);
    let ledger_canister_id = convert_canister_id!(&sns_canister_ids.ledger_canister_id);

    // While interpreting the async calls below, fall back to existing data when some new data for an SNS can't be loaded.
    let existing_data = State::get_cached_sns(root_canister_id).unwrap_or_default();

    crate::state::log(format!("Getting SNS index {index}... list_sns_canisters"));
    let list_sns_canisters: types::ListSnsCanistersResponse =
        ic_cdk::call::Call::unbounded_wait(root_canister_id, "list_sns_canisters")
            .with_arg(types::EmptyRecord {})
            .await
            .map_err(ic_cdk::call::Error::from)
            .and_then(|resp| {
                resp.candid_tuple::<(types::ListSnsCanistersResponse,)>()
                    .map_err(Into::into)
            })
            .map(|(r,)| r)
            .map_err(|err| crate::state::log(format!("Call to Root.list_sns_canisters failed: {err}")))
            .unwrap_or(existing_data.list_sns_canisters);

    crate::state::log(format!("Getting SNS index {index}... get_metadata"));
    let meta: types::GetMetadataResponse = ic_cdk::call::Call::unbounded_wait(governance_canister_id, "get_metadata")
        .with_arg(types::EmptyRecord {})
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(types::GetMetadataResponse,)>().map_err(Into::into))
        .map(|(r,)| r)
        .map_err(|err| crate::state::log(format!("Call to SnsGovernance.get_metadata failed: {err}")))
        .unwrap_or(existing_data.meta);

    crate::state::log(format!("Getting SNS index {index}... list_nervous_system_functions"));
    let parameters: types::ListNervousSystemFunctionsResponse =
        ic_cdk::call::Call::unbounded_wait(governance_canister_id, "list_nervous_system_functions")
            .await
            .map_err(ic_cdk::call::Error::from)
            .and_then(|resp| {
                resp.candid_tuple::<(types::ListNervousSystemFunctionsResponse,)>()
                    .map_err(Into::into)
            })
            .map(|(r,)| r)
            .map_err(|err| {
                crate::state::log(format!(
                    "Call to SnsGovernance.list_nervous_system_functions failed: {err}"
                ));
            })
            .unwrap_or(existing_data.parameters);

    crate::state::log(format!("Getting SNS index {index}... get_metrics_replicated"));
    let arg: types::GetMetricsRequest = GetMetricsRequest {
        time_window_seconds: Some(TIME_WINDOW_SECONDS),
    };
    let metrics = ic_cdk::call::Call::unbounded_wait(governance_canister_id, "get_metrics_replicated")
        .with_arg(arg)
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(Option<_>,)>().map_err(Into::into))
        .map(|(r,)| r)
        .map_err(|err| {
            crate::state::log(format!("Call to SnsGovernance.get_metrics_replicated failed: {err}"));
        })
        .unwrap_or(existing_data.metrics);

    crate::state::log(format!("Getting SNS index {index}... get_latest_reward_event"));
    let latest_reward_event = get_latest_reward_event(governance_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to SnsGovernance.get_latest_reward_event failed: {err}")))
        .ok()
        .or(existing_data.latest_reward_event);

    crate::state::log(format!("Getting SNS index {index}... get_state"));
    let swap_state: GetStateResponse = get_swap_state(swap_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to Swap.get_state failed: {err}")))
        .unwrap_or(existing_data.swap_state);

    crate::state::log(format!("Getting SNS index {index}... icrc1_metadata"));
    let icrc1_metadata: Vec<(String, Icrc1Value)> =
        ic_cdk::call::Call::unbounded_wait(ledger_canister_id, "icrc1_metadata")
            .await
            .map_err(ic_cdk::call::Error::from)
            .and_then(|resp| resp.candid_tuple::<(Vec<(String, Icrc1Value)>,)>().map_err(Into::into))
            .map(|(r,)| r)
            .map_err(|err| crate::state::log(format!("Call to Ledger.icrc1_metadata failed: {err}")))
            .unwrap_or(existing_data.icrc1_metadata);

    crate::state::log(format!("Getting SNS index {index}... icrc1_fee"));
    let icrc1_fee: SnsTokens = ic_cdk::call::Call::unbounded_wait(ledger_canister_id, "icrc1_fee")
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(SnsTokens,)>().map_err(Into::into))
        .map(|(r,)| r)
        .map_err(|err| crate::state::log(format!("Call to Ledger.icrc1_fee failed: {err}")))
        .unwrap_or(existing_data.icrc1_fee);

    let icrc1_total_supply: SnsTokens = ic_cdk::call::Call::unbounded_wait(ledger_canister_id, "icrc1_total_supply")
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(SnsTokens,)>().map_err(Into::into))
        .map(|(r,)| r)
        .map_err(|err| crate::state::log(format!("Call to Ledger.icrc1_total_supply failed: {err}")))
        .unwrap_or(existing_data.icrc1_total_supply);

    let swap_params_response: Option<GetSaleParametersResponse> =
        match ic_cdk::call::Call::unbounded_wait(swap_canister_id, "get_sale_parameters")
            .with_arg(EmptyRecord {})
            .await
            .map_err(ic_cdk::call::Error::from)
            .and_then(|resp| resp.candid_tuple::<(GetSaleParametersResponse,)>().map_err(Into::into))
            .map(|(r,)| r)
        {
            Err(err) => {
                crate::state::log(format!("Call to Swap.get_sale_parameters failed: {err}"));
                None
            }
            Ok(response) => Some(response),
        }
        .or(existing_data.swap_params);

    let init_response: Option<GetInitResponse> = match ic_cdk::call::Call::unbounded_wait(swap_canister_id, "get_init")
        .with_arg(EmptyRecord {})
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(GetInitResponse,)>().map_err(Into::into))
        .map(|(r,)| r)
    {
        Err(err) => {
            crate::state::log(format!("Call to Swap.get_init failed: {err}"));
            None
        }
        Ok(response) => Some(response),
    }
    .or(existing_data.init);

    let derived_state_response: Option<GetDerivedStateResponse> = get_derived_state(swap_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to Swap.get_derived_state failed: {err}")))
        .ok()
        .or(existing_data.derived_state);

    let lifecycle_response: Option<GetLifecycleResponse> = get_lifecycle(swap_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to Governance.get_lifecycle failed: {err}")))
        .ok()
        .or(existing_data.lifecycle);

    let nervous_system_parameters: Option<NervousSystemParameters> =
        get_nervous_system_parameters(governance_canister_id)
            .await
            .map_err(|err| {
                crate::state::log(format!(
                    "Call to SnsGovernance.get_nervous_system_parameters failed: {err}"
                ));
            })
            .ok()
            .or(existing_data.nervous_system_parameters);

    let list_topics_response = sns_gov::Service(governance_canister_id)
        .list_topics(ListTopicsRequest {})
        .await
        .map_err(|err| crate::state::log(format!("Call to Swap.list_topics failed: {err:?}")))
        .map(|response: (_,)| response.0)
        .ok();

    crate::state::log("Yay, got an SNS status".to_string());

    // Limit the size of every SNS controlled field before the aggregator caches it.
    //
    // The limit applies to the value that the aggregator is about to cache.  That value is the
    // new response, or the previous cached value when the call failed.  A cache that an earlier
    // release filled with oversized data therefore recovers on the next update.
    let list_sns_canisters = bounded(
        index,
        "list_sns_canisters",
        list_sns_canisters,
        limits::LIST_SNS_CANISTERS,
    );
    let meta = bounded_metadata(index, meta);
    let metrics = bounded(index, "metrics", metrics, limits::METRICS);
    let latest_reward_event = bounded(
        index,
        "latest_reward_event",
        latest_reward_event,
        limits::LATEST_REWARD_EVENT,
    );
    let parameters = bounded(index, "parameters", parameters, limits::PARAMETERS);
    let nervous_system_parameters = bounded(
        index,
        "nervous_system_parameters",
        nervous_system_parameters,
        limits::NERVOUS_SYSTEM_PARAMETERS,
    );
    let swap_state = bounded(
        index,
        "swap_state",
        strip_unserved_swap_state(swap_state),
        limits::SWAP_STATE,
    );
    let icrc1_metadata = bounded(index, "icrc1_metadata", icrc1_metadata, limits::ICRC1_METADATA);
    let icrc1_fee = bounded(index, "icrc1_fee", icrc1_fee, limits::ICRC1_FEE);
    let icrc1_total_supply = bounded(
        index,
        "icrc1_total_supply",
        icrc1_total_supply,
        limits::ICRC1_TOTAL_SUPPLY,
    );
    let swap_params_response = bounded(index, "swap_params", swap_params_response, limits::SWAP_PARAMS);
    let init_response = bounded(index, "init", init_response, limits::INIT);
    let derived_state_response = bounded(index, "derived_state", derived_state_response, limits::DERIVED_STATE);
    let lifecycle_response = bounded(index, "lifecycle", lifecycle_response, limits::LIFECYCLE);
    let list_topics_response = bounded(index, "topics", list_topics_response, limits::TOPICS);

    // If the SNS sale will open, collect data when it does.
    FastScheduler::global_schedule_sns(&swap_state);
    // Save the data in the state.
    let slow_data = UpstreamData {
        index,
        canister_ids: sns_canister_ids,
        list_sns_canisters,
        meta,
        metrics,
        latest_reward_event,
        parameters,
        nervous_system_parameters,
        swap_state,
        icrc1_metadata,
        icrc1_fee,
        icrc1_total_supply,
        swap_params: swap_params_response,
        init: init_response,
        derived_state: derived_state_response,
        lifecycle: lifecycle_response,
        topics: list_topics_response,
    };
    State::insert_sns(index, &slow_data)
        .map_err(|err| crate::state::log(format!("Failed to create certified assets: {err}")))
        .unwrap_or_default();
    crate::state::log(format!("Getting SNS index {index}... DONE"));
    Ok(())
}

/// Gets the state of the swap.
///
/// Note: This API is deprecated but must not be removed until the NNS-dapp UI is updated.
pub async fn get_swap_state(swap_canister_id: Principal) -> CallResult<GetStateResponse> {
    ic_cdk::call::Call::unbounded_wait(swap_canister_id, "get_state")
        .with_arg(EmptyRecord {})
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(GetStateResponse,)>().map_err(Into::into))
        .map(|(r,)| r)
}

/// Gets the derived state of the swap canister; this is a small subset of the state with headline values such as number of participants.
pub async fn get_derived_state(swap_canister_id: Principal) -> CallResult<GetDerivedStateResponse> {
    ic_cdk::call::Call::unbounded_wait(swap_canister_id, "get_derived_state")
        .with_arg(EmptyRecord {})
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(GetDerivedStateResponse,)>().map_err(Into::into))
        .map(|(r,)| r)
}

/// Gets the current lifecycle of an SNS.
pub async fn get_lifecycle(swap_canister_id: Principal) -> CallResult<GetLifecycleResponse> {
    ic_cdk::call::Call::unbounded_wait(swap_canister_id, "get_lifecycle")
        .with_arg(EmptyRecord {})
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(GetLifecycleResponse,)>().map_err(Into::into))
        .map(|(r,)| r)
}

/// Gets the SNS nervous system parameters.
pub async fn get_nervous_system_parameters(governance_canister_id: Principal) -> CallResult<NervousSystemParameters> {
    ic_cdk::call::Call::unbounded_wait(governance_canister_id, "get_nervous_system_parameters")
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(NervousSystemParameters,)>().map_err(Into::into))
        .map(|(r,)| r)
}

/// Gets the latest voting reward distribution data.
pub async fn get_latest_reward_event(governance_canister_id: Principal) -> CallResult<sns_gov::RewardEvent> {
    ic_cdk::call::Call::unbounded_wait(governance_canister_id, "get_latest_reward_event")
        .await
        .map_err(ic_cdk::call::Error::from)
        .and_then(|resp| resp.candid_tuple::<(sns_gov::RewardEvent,)>().map_err(Into::into))
        .map(|(r,)| r)
}
