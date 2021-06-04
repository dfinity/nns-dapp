use crate::canisters::governance::{self, ClaimOrRefreshNeuronFromAccount, claim_or_refresh_neuron_from_account_response};
use crate::ledger_sync;
use crate::state::STATE;
use crate::accounts_store::TransactionToBeProcessed;
use dfn_core::api::PrincipalId;
use ledger_canister::Memo;

const PRUNE_TRANSACTIONS_COUNT: u32 = 1000;

pub async fn run_periodic_tasks() {
    ledger_sync::sync_transactions().await;

    let maybe_transaction_to_process = STATE.write().unwrap().accounts_store.try_take_next_transaction_to_process();
    if let Some(transaction_to_process) = maybe_transaction_to_process {
        match transaction_to_process {
            TransactionToBeProcessed::StakeNeuron(principal, memo) => {
                stake_neuron(principal, memo).await;
            },
            TransactionToBeProcessed::TopUpNeuron(principal, memo) => {
                top_up_neuron(principal, memo).await;
            },
        }
    }

    if should_prune_transactions() {
        let store = &mut STATE.write().unwrap().accounts_store;
        store.prune_transactions(PRUNE_TRANSACTIONS_COUNT);
    }
}

async fn stake_neuron(principal: PrincipalId, memo: Memo) {
    claim_or_refresh_neuron(principal, memo, false).await;
}

async fn top_up_neuron(principal: PrincipalId, memo: Memo) {
    claim_or_refresh_neuron(principal, memo, true).await;
}

async fn claim_or_refresh_neuron(principal: PrincipalId, memo: Memo, is_top_up: bool) {
    let request = ClaimOrRefreshNeuronFromAccount {
        controller: Some(principal),
        memo: memo.0
    };

    match governance::claim_or_refresh_neuron_from_account(request).await {
        Ok(response) => match response.result {
            Some(claim_or_refresh_neuron_from_account_response::Result::NeuronId(neuron_id)) => {
                if is_top_up {
                    STATE.write().unwrap().accounts_store.mark_neuron_topped_up();
                } else {
                    STATE.write().unwrap().accounts_store.mark_neuron_created(&principal, memo, neuron_id.into());
                }
            },
            _ => {
                // TODO NU-76 Handle any errors returned by the claim_or_refresh_neuron method
            }
        },
        Err(_) => {
            // TODO NU-76 Handle any errors returned by the claim_or_refresh_neuron method
        }
    }
}

fn should_prune_transactions() -> bool {
    #[cfg(target_arch = "wasm32")]
        {
            const MEMORY_LIMIT_BYTES: u32 = 1024 * 1024 * 1024; // 1GB
            let memory_usage_bytes = (core::arch::wasm32::memory_size(0) * 65536) as u32;
            memory_usage_bytes > MEMORY_LIMIT_BYTES
        }

    #[cfg(not(target_arch = "wasm32"))]
        {
            const TRANSACTIONS_COUNT_LIMIT: u32 = 1_000_000;
            let store = &mut STATE.write().unwrap().accounts_store;
            let transactions_count = store.get_transactions_count();
            transactions_count > TRANSACTIONS_COUNT_LIMIT
        }
}