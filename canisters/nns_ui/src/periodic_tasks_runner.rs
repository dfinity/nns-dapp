use crate::accounts_store::{CreateCanisterArgs, RefundTransactionArgs, TopUpCanisterArgs};
use crate::canisters::governance::{self, ClaimOrRefreshNeuronFromAccount, claim_or_refresh_neuron_from_account_response};
use crate::canisters::ledger;
use crate::constants::{MEMO_CREATE_CANISTER, MEMO_TOP_UP_CANISTER};
use crate::ledger_sync;
use crate::multi_part_transactions_processor::MultiPartTransactionToBeProcessed;
use crate::state::STATE;
use dfn_core::api::{CanisterId, PrincipalId};
use ic_nns_common::types::NeuronId;
use ic_nns_constants::CYCLES_MINTING_CANISTER_ID;
use ledger_canister::{
    AccountBalanceArgs,
    AccountIdentifier,
    BlockHeight,
    CyclesResponse,
    ICPTs,
    Memo,
    NotifyCanisterArgs,
    SendArgs,
    Subaccount,
    TRANSACTION_FEE,
};

const PRUNE_TRANSACTIONS_COUNT: u32 = 1000;

pub async fn run_periodic_tasks() {
    ledger_sync::sync_transactions().await;

    let maybe_transaction_to_process = STATE.write().unwrap().accounts_store.try_take_next_transaction_to_process();
    if let Some((block_height, transaction_to_process)) = maybe_transaction_to_process {
        match transaction_to_process {
            MultiPartTransactionToBeProcessed::StakeNeuron(principal, memo) => {
                handle_stake_neuron(block_height, principal, memo).await;
            },
            MultiPartTransactionToBeProcessed::TopUpNeuron(principal, memo) => {
                handle_top_up_neuron(block_height, principal, memo).await;
            },
            MultiPartTransactionToBeProcessed::CreateCanister(args) => {
                handle_create_canister(block_height, args).await;
            },
            MultiPartTransactionToBeProcessed::TopUpCanister(args) => {
                handle_top_up_canister(block_height, args).await;
            },
            MultiPartTransactionToBeProcessed::RefundTransaction(args) => {
                handle_refund(args).await;
            }
        }
    }

    if should_prune_transactions() {
        let store = &mut STATE.write().unwrap().accounts_store;
        store.prune_transactions(PRUNE_TRANSACTIONS_COUNT);
    }
}

async fn handle_stake_neuron(block_height: BlockHeight, principal: PrincipalId, memo: Memo) {
    match claim_or_refresh_neuron(principal, memo).await {
        Ok(neuron_id) => STATE.write().unwrap().accounts_store.mark_neuron_created(&principal, block_height, memo, neuron_id),
        Err(e) => STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, e, false)
    }
}

async fn handle_top_up_neuron(block_height: BlockHeight, principal: PrincipalId, memo: Memo) {
    match claim_or_refresh_neuron(principal, memo).await {
        Ok(_) => STATE.write().unwrap().accounts_store.mark_neuron_topped_up(block_height),
        Err(e) => STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, e, false)
    }
}

async fn handle_create_canister(block_height: BlockHeight, args: CreateCanisterArgs) {
    match create_canister(args.controller, args.amount).await {
        Ok(CyclesResponse::CanisterCreated(canister_id)) => {
            STATE.write().unwrap().accounts_store.attach_newly_created_canister(
                args.controller,
                block_height,
                canister_id,
            );
        },
        Ok(CyclesResponse::Refunded(error, _)) => {
            let subaccount = (&args.controller).into();
            enqueue_create_or_top_up_canister_refund(args.controller, subaccount, block_height, args.refund_address, error.clone()).await;
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, error, true);
        },
        Ok(CyclesResponse::ToppedUp(_)) => {
            // This should never happen
            let error = "Unexpected response in 'create_canister': 'topped up'".to_string();
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, error, false);
        }
        Err(error) => {
            let subaccount = (&args.controller).into();
            enqueue_create_or_top_up_canister_refund(args.controller, subaccount, block_height, args.refund_address, error.clone()).await;
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, error, true);
        }
    }
}

async fn handle_top_up_canister(block_height: BlockHeight, args: TopUpCanisterArgs) {
    match top_up_canister(args.canister_id, args.amount).await {
        Ok(CyclesResponse::ToppedUp(_)) => {
            STATE.write().unwrap().accounts_store.mark_canister_topped_up(block_height);
        },
        Ok(CyclesResponse::Refunded(error, _)) => {
            let subaccount = (&args.canister_id.get()).into();
            enqueue_create_or_top_up_canister_refund(args.principal, subaccount, block_height, args.refund_address, error.clone()).await;
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, error, true);
        },
        Ok(CyclesResponse::CanisterCreated(_)) => {
            // This should never happen
            let error = "Unexpected response in 'top_up_canister': 'canister created'".to_string();
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, error, false);
        }
        Err(error) => {
            let subaccount = (&args.principal).into();
            enqueue_create_or_top_up_canister_refund(args.principal, subaccount, block_height, args.refund_address, error.clone()).await;
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(block_height, error, true);
        }
    }
}

async fn handle_refund(args: RefundTransactionArgs) {
    let send_request = SendArgs {
        memo: Memo(0),
        amount: args.amount,
        fee: TRANSACTION_FEE,
        from_subaccount: Some(args.from_sub_account),
        to: args.refund_address,
        created_at_time: None,
    };

    match ledger::send(send_request.clone()).await {
        Ok(block_height) => {
            STATE.write().unwrap().accounts_store.process_transaction_refund_completed(
                args.original_transaction_block_height,
                block_height,
                args.error_message);
        },
        Err(error) => {
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(
                args.original_transaction_block_height,
                error,
                false);
        }
    }
}

async fn claim_or_refresh_neuron(principal: PrincipalId, memo: Memo) -> Result<NeuronId, String> {
    let request = ClaimOrRefreshNeuronFromAccount {
        controller: Some(principal),
        memo: memo.0
    };

    match governance::claim_or_refresh_neuron_from_account(request).await {
        Ok(response) => match response.result {
            Some(claim_or_refresh_neuron_from_account_response::Result::NeuronId(neuron_id)) => {
                Ok(neuron_id.into())
            },
            Some(claim_or_refresh_neuron_from_account_response::Result::Error(e)) => Err(e.error_message),
            None => Err("'response.result' was empty".to_string())
        },
        Err(e) => Err(e)
    }
}

async fn create_canister(principal: PrincipalId, amount: ICPTs) -> Result<CyclesResponse, String> {
    // We need to hold back 1 transaction fee for the 'send' and also 1 for the 'notify'
    let send_amount = ICPTs::from_e8s(amount.get_e8s() - (2 * TRANSACTION_FEE.get_e8s()));
    let subaccount: Subaccount = (&principal).into();

    let send_request = SendArgs {
        memo: MEMO_CREATE_CANISTER,
        amount: send_amount,
        fee: TRANSACTION_FEE,
        from_subaccount: Some(subaccount),
        to: AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some(subaccount)),
        created_at_time: None,
    };

    let block_height = ledger::send(send_request.clone()).await?;

    let notify_request = NotifyCanisterArgs::new_from_send(
        &send_request,
        block_height,
        CYCLES_MINTING_CANISTER_ID,
        Some(subaccount))?;

    Ok(ledger::notify(notify_request).await?)
}


async fn top_up_canister(canister_id: CanisterId, amount: ICPTs) -> Result<CyclesResponse, String> {
    // We need to hold back 1 transaction fee for the 'send' and also 1 for the 'notify'
    let send_amount = ICPTs::from_e8s(amount.get_e8s() - (2 * TRANSACTION_FEE.get_e8s()));
    let subaccount: Subaccount = (&canister_id).into();

    let send_request = SendArgs {
        memo: MEMO_TOP_UP_CANISTER,
        amount: send_amount,
        fee: TRANSACTION_FEE,
        from_subaccount: Some(subaccount),
        to: AccountIdentifier::new(CYCLES_MINTING_CANISTER_ID.into(), Some(subaccount)),
        created_at_time: None,
    };

    let block_height = ledger::send(send_request.clone()).await?;

    let notify_request = NotifyCanisterArgs::new_from_send(
        &send_request,
        block_height,
        CYCLES_MINTING_CANISTER_ID,
        Some(subaccount))?;

    Ok(ledger::notify(notify_request).await?)
}

async fn enqueue_create_or_top_up_canister_refund(
    principal: PrincipalId,
    subaccount: Subaccount,
    block_height: BlockHeight,
    refund_address: AccountIdentifier,
    error_message: String) {

    let from_account = AccountIdentifier::new(dfn_core::api::id().get(), Some(subaccount));
    let balance_request = AccountBalanceArgs { account: from_account };

    match ledger::account_balance(balance_request).await {
        Ok(balance) => {
            let refund_amount = ICPTs::from_e8s(balance.get_e8s() - TRANSACTION_FEE.get_e8s());
            let refund_args = RefundTransactionArgs {
                recipient_principal: principal,
                from_sub_account: subaccount,
                amount: refund_amount,
                original_transaction_block_height: block_height,
                refund_address,
                error_message,
            };
            STATE.write().unwrap().accounts_store.enqueue_transaction_to_be_refunded(refund_args);
        },
        Err(error) => {
            STATE.write().unwrap().accounts_store.process_multi_part_transaction_error(
                block_height,
                error,
                false);
        }
    };
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
