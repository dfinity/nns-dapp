use crate::canisters::{cmc, governance};
use crate::ledger_sync;
use crate::multi_part_transactions_processor::MultiPartTransactionToBeProcessed;
use crate::state::with_state_mut;
use crate::Cycles;
use cycles_minting_canister::{NotifyCreateCanister, NotifyError, NotifyTopUp};
use dfn_core::api::{CanisterId, PrincipalId};
use ic_nns_common::types::NeuronId;
use ic_nns_governance::pb::v1::{claim_or_refresh_neuron_from_account_response, ClaimOrRefreshNeuronFromAccount};
use icp_ledger::{BlockIndex, Memo};

pub async fn run_periodic_tasks() {
    ledger_sync::sync_transactions().await;

    with_state_mut(|state| {
        state.performance.increment_periodic_tasks_run();
    });

    let maybe_transaction_to_process = with_state_mut(|s| s.accounts_store.try_take_next_transaction_to_process());
    if let Some((block_height, transaction_to_process)) = maybe_transaction_to_process {
        match transaction_to_process {
            MultiPartTransactionToBeProcessed::ParticipateSwap(_principal, _from, _to, _swap_canister_id) => {
                // DO NOTHING
                // Handling ParticipateSwap is not supported.
            }
            MultiPartTransactionToBeProcessed::StakeNeuron(principal, memo) => {
                handle_stake_neuron(principal, memo).await;
            }
            MultiPartTransactionToBeProcessed::CreateCanisterV2(controller) => {
                handle_create_canister_v2(block_height, controller).await;
            }
            MultiPartTransactionToBeProcessed::TopUpCanisterV2(principal, canister_id) => {
                handle_top_up_canister_v2(block_height, principal, canister_id).await;
            }
        }
    }
}

async fn handle_stake_neuron(principal: PrincipalId, memo: Memo) {
    match claim_or_refresh_neuron(principal, memo).await {
        Ok(_neuron_id) => (),
        Err(_error) => (),
    }
}

async fn handle_create_canister_v2(block_height: BlockIndex, controller: PrincipalId) {
    match create_canister_v2(block_height, controller).await {
        Ok(Ok(canister_id)) => with_state_mut(|s| {
            s.accounts_store.attach_newly_created_canister(controller, canister_id);
        }),
        Ok(Err(NotifyError::Processing)) => {
            with_state_mut(|s| {
                s.accounts_store.enqueue_multi_part_transaction(
                    block_height,
                    MultiPartTransactionToBeProcessed::CreateCanisterV2(controller),
                );
            });
        }
        Ok(Err(_error)) => (),
        Err(_error) => (),
    }
}

async fn handle_top_up_canister_v2(block_height: BlockIndex, principal: PrincipalId, canister_id: CanisterId) {
    match top_up_canister_v2(block_height, canister_id).await {
        Ok(Ok(_)) => (),
        Ok(Err(NotifyError::Processing)) => {
            with_state_mut(|s| {
                s.accounts_store.enqueue_multi_part_transaction(
                    block_height,
                    MultiPartTransactionToBeProcessed::CreateCanisterV2(principal),
                );
            });
        }
        Ok(Err(_error)) => (),
        Err(_error) => (),
    }
}

async fn claim_or_refresh_neuron(principal: PrincipalId, memo: Memo) -> Result<NeuronId, String> {
    let request = ClaimOrRefreshNeuronFromAccount {
        controller: Some(principal),
        memo: memo.0,
    };

    match governance::claim_or_refresh_neuron_from_account(request).await {
        Ok(response) => match response.result {
            Some(claim_or_refresh_neuron_from_account_response::Result::NeuronId(neuron_id)) => Ok(neuron_id.into()),
            Some(claim_or_refresh_neuron_from_account_response::Result::Error(e)) => Err(e.error_message),
            None => Err("'response.result' was empty".to_string()),
        },
        Err(e) => Err(e),
    }
}

async fn create_canister_v2(
    block_index: BlockIndex,
    controller: PrincipalId,
) -> Result<Result<CanisterId, NotifyError>, String> {
    #[allow(deprecated)]
    let notify_request = NotifyCreateCanister {
        block_index,
        controller,
        subnet_type: None,
        subnet_selection: None,
        settings: None,
    };

    cmc::notify_create_canister(notify_request).await
}

async fn top_up_canister_v2(
    block_index: BlockIndex,
    canister_id: CanisterId,
) -> Result<Result<Cycles, NotifyError>, String> {
    let notify_request = NotifyTopUp {
        block_index,
        canister_id,
    };

    cmc::notify_top_up_canister(notify_request).await
}
