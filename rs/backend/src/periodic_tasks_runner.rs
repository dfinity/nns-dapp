use crate::canisters::cmc;
use crate::multi_part_transactions_processor::MultiPartTransactionToBeProcessed;
use crate::state::with_state_mut;
use cycles_minting_canister::{NotifyCreateCanister, NotifyError};
use dfn_core::api::{CanisterId, PrincipalId};
use icp_ledger::BlockIndex;

pub async fn run_periodic_tasks() {
    with_state_mut(|state| {
        state.performance.increment_periodic_tasks_run();
    });

    let maybe_transaction_to_process = with_state_mut(|s| s.accounts_store.try_take_next_transaction_to_process());
    if let Some((block_height, transaction_to_process)) = maybe_transaction_to_process {
        match transaction_to_process {
            MultiPartTransactionToBeProcessed::CreateCanisterV2(controller) => {
                handle_create_canister_v2(block_height, controller).await;
            }
        }
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
