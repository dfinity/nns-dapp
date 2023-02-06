//! Functions that get data from upstream SNS and NNS canisters.
use std::str::FromStr;

use crate::convert_canister_id;
use crate::state::{State, STATE};
use crate::types::ic_sns_wasm::{DeployedSns, ListDeployedSnsesResponse};
use crate::types::state::UpstreamData;
use crate::types::{self, EmptyRecord, GetStateResponse, Icrc1Value, SnsTokens};
use anyhow::anyhow;
use ic_cdk::api::{call::RejectionCode, management_canister::provisional::CanisterId, time};

/// Updates one part of the cache:  Either the list of SNSs or one SNS.
pub async fn update_cache() {
    ic_cdk::println!("Getting upstream data...");
    let sns_maybe = STATE.with(|state| {
        state.stable.borrow().sns_cache.borrow_mut().last_partial_update = time();
        state.stable.borrow().sns_cache.borrow_mut().sns_to_get.pop()
    });
    ic_cdk::println!("Maybe have SNSs");
    let result = if let Some((index, sns)) = sns_maybe {
        ic_cdk::println!("Consumed an SNS");
        get_sns_data(index, sns).await
    } else {
        // Timestamp start of cycle
        STATE.with(|state| {
            state.stable.borrow().sns_cache.borrow_mut().last_update = time();
        });
        ic_cdk::println!("Need to get more SNSs");
        set_list_of_sns_to_get().await
    };
    if let Err(err) = result {
        ic_cdk::println!("Heartbeat command failed with: {err:?}");
    }
}

/// Gets a list of SNSs from the nns-sns-wasm canister and puts it in the queue of SNSs to query.
///
/// Note: We can improve on this by filtering out SNSs that have become const.
async fn set_list_of_sns_to_get() -> anyhow::Result<()> {
    ic_cdk::println!("Asking for more SNSs");
    let result: Result<(ListDeployedSnsesResponse,), (RejectionCode, std::string::String)> = ic_cdk::api::call::call(
        CanisterId::from_text("qaa6y-5yaaa-aaaaa-aaafa-cai").expect("I don't believe it's not a valid canister ID??!"),
        "list_deployed_snses",
        (EmptyRecord {},),
    )
    .await;
    ic_cdk::println!("Asked for more SNSs");
    match result {
        Err((_rejection_code, message)) => {
            ic_cdk::println!("Cache update failed: {}", message);
            Err(anyhow!("Cache update failed: {}", message))
        }
        Ok((stuff,)) => {
            ic_cdk::println!(
                "Yay, got {} SNSs: {}",
                stuff.instances.len(),
                serde_json::to_string(&stuff).unwrap_or_else(|_| "Could not serialise response".to_string())
            );
            let instances: Vec<_> = (0..).zip(stuff.instances.into_iter()).collect();
            STATE.with(|state| {
                state.stable.borrow().sns_cache.borrow_mut().sns_to_get = instances;
            });
            Ok(())
        }
    }
}

/// Populates the cache with the data for an SNS.
async fn get_sns_data(index: u64, sns_canister_ids: DeployedSns) -> anyhow::Result<()> {
    let swap_canister_id = convert_canister_id!(&sns_canister_ids.swap_canister_id);
    let root_canister_id = convert_canister_id!(&sns_canister_ids.root_canister_id);
    let governance_canister_id = convert_canister_id!(&sns_canister_ids.governance_canister_id);
    let ledger_canister_id = convert_canister_id!(&sns_canister_ids.ledger_canister_id);

    let list_sns_canisters: types::ListSnsCanistersResponse =
        ic_cdk::api::call::call(root_canister_id, "list_sns_canisters", (types::EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
            .expect("Failed to list SNS canisters");

    let meta: types::GetMetadataResponse =
        ic_cdk::api::call::call(governance_canister_id, "get_metadata", (types::EmptyRecord {},))
            .await
            .map(|response: (_,)| response.0)
            .expect("Failed to get SNS metadata");

    let parameters: types::ListNervousSystemFunctionsResponse =
        ic_cdk::api::call::call(governance_canister_id, "list_nervous_system_functions", ((),))
            .await
            .map(|response: (_,)| response.0)
            .expect("Failed to get SNS parameters");

    let swap_state: GetStateResponse = ic_cdk::api::call::call(swap_canister_id, "get_state", (EmptyRecord {},))
        .await
        .map(|response: (_,)| response.0)
        .expect("Failed to get swap state");

    let icrc1_metadata: Vec<(String, Icrc1Value)> =
        ic_cdk::api::call::call(ledger_canister_id, "icrc1_metadata", ((),))
            .await
            .map(|response: (_,)| response.0)
            .expect("Failed to get ledger metadata");

    let icrc1_fee: SnsTokens = ic_cdk::api::call::call(ledger_canister_id, "icrc1_fee", ((),))
        .await
        .map(|response: (_,)| response.0)
        .expect("Failed to get ledger fee");

    ic_cdk::println!("Yay, got an SNS status");
    let slow_data = UpstreamData {
        index,
        canister_ids: sns_canister_ids,
        list_sns_canisters,
        meta,
        parameters,
        swap_state,
        icrc1_metadata,
        icrc1_fee,
    };
    State::insert_sns(index, slow_data).expect("Failed to create certified assets");
    Ok(())
}
