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
use ic_cdk::api::{call::RejectionCode, management_canister::provisional::CanisterId, time};

/// default time window to get SNS metrics is 2 months.
const TIME_WINDOW_SECONDS: u64 = 2 * 30 * 24 * 3600;

/// Updates one part of the cache:  Either the list of SNSs or one SNS.
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
        crate::state::log(format!("SNS update command failed with: {err:?}"));
    }
}

/// The NNS SNS Wasm canister ID
///
/// This canister contains a list of all SNS root canisters it has created.
#[allow(clippy::expect_used)]
fn nns_sns_wasm_canister_id() -> CanisterId {
    CanisterId::from_text("qaa6y-5yaaa-aaaaa-aaafa-cai").expect("I don't believe it's not a valid canister ID??!")
}

/// Gets a list of SNSs from the nns-sns-wasm canister and puts it in the queue of SNSs to query.
///
/// Note: We can improve on this by filtering out SNSs that have stopped changing.
async fn set_list_of_sns_to_get() -> anyhow::Result<()> {
    crate::state::log("Asking for more SNSs".to_string());
    let result: Result<(ListDeployedSnsesResponse,), (RejectionCode, std::string::String)> =
        ic_cdk::api::call::call(nns_sns_wasm_canister_id(), "list_deployed_snses", (EmptyRecord {},)).await;
    crate::state::log("Asked for more SNSs".to_string());
    match result {
        Err((_rejection_code, message)) => {
            crate::state::log(format!("Cache update failed: {message}"));
            Err(anyhow!("Cache update failed: {}", message))
        }
        Ok((stuff,)) => {
            crate::state::log(format!(
                "Yay, got {} SNSs: {}",
                stuff.instances.len(),
                serde_json::to_string(&stuff).unwrap_or_else(|_| "Could not serialise response".to_string())
            ));
            let instances: Vec<_> = (0..).zip(stuff.instances.into_iter()).collect();
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
        ic_cdk::api::call::call(root_canister_id, "list_sns_canisters", (types::EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
            .map_err(|err| crate::state::log(format!("Call to Root.list_sns_canisters failed: {err:?}")))
            .unwrap_or(existing_data.list_sns_canisters);

    crate::state::log(format!("Getting SNS index {index}... get_metadata"));
    let meta: types::GetMetadataResponse =
        ic_cdk::api::call::call(governance_canister_id, "get_metadata", (types::EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
            .map_err(|err| crate::state::log(format!("Call to SnsGovernance.get_metadata failed: {err:?}")))
            .unwrap_or(existing_data.meta);

    crate::state::log(format!("Getting SNS index {index}... list_nervous_system_functions"));
    let parameters: types::ListNervousSystemFunctionsResponse =
        ic_cdk::api::call::call(governance_canister_id, "list_nervous_system_functions", ((),))
            .await
            .map(|response: (_,)| response.0)
            .map_err(|err| {
                crate::state::log(format!(
                    "Call to SnsGovernance.list_nervous_system_functions failed: {err:?}"
                ));
            })
            .unwrap_or(existing_data.parameters);

    crate::state::log(format!("Getting SNS index {index}... get_metrics"));
    let arg: types::GetMetricsRequest = GetMetricsRequest {
        time_window_seconds: Some(TIME_WINDOW_SECONDS),
    };
    let metrics = ic_cdk::api::call::call(governance_canister_id, "get_metrics", (arg,))
        .await
        .map(|response: (_,)| response.0)
        .map_err(|err| {
            crate::state::log(format!("Call to SnsGovernance.get_metrics failed: {err:?}"));
        })
        .unwrap_or(existing_data.metrics);

    crate::state::log(format!("Getting SNS index {index}... get_latest_reward_event"));
    let latest_reward_event = get_latest_reward_event(governance_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to SnsGovernance.get_latest_reward_event failed: {err:?}")))
        .ok()
        .or(existing_data.latest_reward_event);

    crate::state::log(format!("Getting SNS index {index}... get_state"));
    let swap_state: GetStateResponse = get_swap_state(swap_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to Swap.get_state failed: {err:?}")))
        .unwrap_or(existing_data.swap_state);

    crate::state::log(format!("Getting SNS index {index}... icrc1_metadata"));
    let icrc1_metadata: Vec<(String, Icrc1Value)> =
        ic_cdk::api::call::call(ledger_canister_id, "icrc1_metadata", ((),))
            .await
            .map(|response: (_,)| response.0)
            .map_err(|err| crate::state::log(format!("Call to Ledger.icrc1_metadata failed: {err:?}")))
            .unwrap_or(existing_data.icrc1_metadata);

    crate::state::log(format!("Getting SNS index {index}... icrc1_fee"));
    let icrc1_fee: SnsTokens = ic_cdk::api::call::call(ledger_canister_id, "icrc1_fee", ((),))
        .await
        .map(|response: (_,)| response.0)
        .map_err(|err| crate::state::log(format!("Call to Ledger.icrc1_fee failed: {err:?}")))
        .unwrap_or(existing_data.icrc1_fee);

    let icrc1_total_supply: SnsTokens = ic_cdk::api::call::call(ledger_canister_id, "icrc1_total_supply", ((),))
        .await
        .map(|response: (_,)| response.0)
        .map_err(|err| crate::state::log(format!("Call to Ledger.icrc1_total_supply failed: {err:?}")))
        .unwrap_or(existing_data.icrc1_total_supply);

    let swap_params_response: Option<GetSaleParametersResponse> =
        match ic_cdk::api::call::call(swap_canister_id, "get_sale_parameters", (EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
        {
            Err(err) => {
                crate::state::log(format!("Call to Swap.get_sale_parameters failed: {err:?}"));
                None
            }
            Ok(response) => Some(response),
        }
        .or(existing_data.swap_params);

    let init_response: Option<GetInitResponse> =
        match ic_cdk::api::call::call(swap_canister_id, "get_init", (EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
        {
            Err(err) => {
                crate::state::log(format!("Call to Swap.get_init failed: {err:?}"));
                None
            }
            Ok(response) => Some(response),
        }
        .or(existing_data.init);

    let derived_state_response: Option<GetDerivedStateResponse> = get_derived_state(swap_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to Swap.get_derived_state failed: {err:?}")))
        .ok()
        .or(existing_data.derived_state);

    let lifecycle_response: Option<GetLifecycleResponse> = get_lifecycle(swap_canister_id)
        .await
        .map_err(|err| crate::state::log(format!("Call to Governance.get_lifecycle failed: {err:?}")))
        .ok()
        .or(existing_data.lifecycle);

    let nervous_system_parameters: Option<NervousSystemParameters> =
        get_nervous_system_parameters(governance_canister_id)
            .await
            .map_err(|err| {
                crate::state::log(format!(
                    "Call to SnsGovernance.get_nervous_system_parameters failed: {err:?}"
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
        .map_err(|err| crate::state::log(format!("Failed to create certified assets: {err:?}")))
        .unwrap_or_default();
    crate::state::log(format!("Getting SNS index {index}... DONE"));
    Ok(())
}

/// Gets the state of the swap.
///
/// Note: This API is deprecated but must not be removed until the NNS-dapp UI is updated.
pub async fn get_swap_state(swap_canister_id: Principal) -> Result<GetStateResponse, (RejectionCode, String)> {
    ic_cdk::api::call::call(swap_canister_id, "get_state", (EmptyRecord {},))
        .await
        .map(|response: (_,)| response.0)
}

/// Gets the derived state of the swap canister; this is a small subset of the state with headline values such as number of participants.
pub async fn get_derived_state(
    swap_canister_id: Principal,
) -> Result<GetDerivedStateResponse, (RejectionCode, String)> {
    ic_cdk::api::call::call(swap_canister_id, "get_derived_state", (EmptyRecord {},))
        .await
        .map(|response: (_,)| response.0)
}

/// Gets the current lifecycle of an SNS.
pub async fn get_lifecycle(swap_canister_id: Principal) -> Result<GetLifecycleResponse, (RejectionCode, String)> {
    ic_cdk::api::call::call(swap_canister_id, "get_lifecycle", (EmptyRecord {},))
        .await
        .map(|response: (_,)| response.0)
}

/// Gets the SNS nervous system parameters.
pub async fn get_nervous_system_parameters(
    governance_canister_id: Principal,
) -> Result<NervousSystemParameters, (RejectionCode, String)> {
    ic_cdk::api::call::call(governance_canister_id, "get_nervous_system_parameters", ())
        .await
        .map(|response: (_,)| response.0)
}

/// Gets the latest voting reward distribution data.
pub async fn get_latest_reward_event(
    governance_canister_id: Principal,
) -> Result<sns_gov::RewardEvent, (RejectionCode, String)> {
    ic_cdk::call(governance_canister_id, "get_latest_reward_event", ())
        .await
        .map(|response: (_,)| response.0)
}
