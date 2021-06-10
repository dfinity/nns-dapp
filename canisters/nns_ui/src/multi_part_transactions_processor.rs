use candid::CandidType;
use crate::accounts_store::{CreateCanisterArgs, TopUpCanisterArgs, RefundTransactionArgs};
use ic_base_types::{PrincipalId, CanisterId};
use ic_nns_common::types::NeuronId;
use ledger_canister::{Memo, BlockHeight};
use serde::Deserialize;
use std::collections::{VecDeque, BTreeMap};

#[derive(Default, CandidType, Deserialize)]
pub struct MultiPartTransactionsProcessor {
    queue: VecDeque<(BlockHeight, MultiPartTransactionToBeProcessed)>,
    statuses: BTreeMap<BlockHeight, (PrincipalId, MultiPartTransactionStatus)>,
    errors: Vec<(BlockHeight, String)>,
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum MultiPartTransactionToBeProcessed {
    StakeNeuron(PrincipalId, Memo),
    TopUpNeuron(PrincipalId, Memo),
    CreateCanister(CreateCanisterArgs),
    TopUpCanister(TopUpCanisterArgs),
    RefundTransaction(RefundTransactionArgs),
}

#[derive(Clone, CandidType, Deserialize)]
pub enum MultiPartTransactionStatus {
    NeuronCreated(NeuronId),
    CanisterCreated(CanisterId),
    Complete,
    Refunded(BlockHeight),
    Error(String),
    NotFound,
    PendingSync,
    Queued,
}

impl MultiPartTransactionsProcessor {
    pub fn push(&mut self, principal: PrincipalId, block_height: BlockHeight, transaction_to_be_processed: MultiPartTransactionToBeProcessed) {
        self.queue.push_back((block_height, transaction_to_be_processed));
        self.statuses.insert(block_height, (principal, MultiPartTransactionStatus::Queued));
    }

    pub fn take_next(&mut self) -> Option<(BlockHeight, MultiPartTransactionToBeProcessed)> {
        self.queue.pop_front()
    }

    pub fn update_status(&mut self, block_height: BlockHeight, status: MultiPartTransactionStatus) {
        if let MultiPartTransactionStatus::Error(msg) = &status {
            self.errors.push((block_height, msg.clone()));
        }

        if let Some((_, s)) = self.statuses.get_mut(&block_height) {
            *s = status;
        }
    }

    pub fn get_status(&self, principal: PrincipalId, block_height: BlockHeight) -> MultiPartTransactionStatus {
        self.statuses.get(&block_height)
            .filter(|(p, _)| *p == principal)
            .map(|(_, t)| t)
            .cloned()
            .unwrap_or(MultiPartTransactionStatus::NotFound)
    }
}