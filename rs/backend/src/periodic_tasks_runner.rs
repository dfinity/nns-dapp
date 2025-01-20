use crate::canisters::cmc;
use crate::multi_part_transactions_processor::MultiPartTransactionToBeProcessed;
use crate::state::with_state_mut;
use cycles_minting_canister::{NotifyCreateCanister, NotifyError};
use dfn_core::api::{CanisterId, PrincipalId};
use icp_ledger::BlockIndex;

#[allow(dead_code)]
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
