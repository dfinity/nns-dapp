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
    errors: Vec<MultiPartTransactionError>,
}

#[derive(Clone, CandidType, Deserialize)]
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
    Refunded(BlockHeight, String),
    Error(String),
    ErrorWithRefundPending(String),
    NotFound,
    PendingSync,
    Queued,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct MultiPartTransactionError {
    block_height: BlockHeight,
    error_message: String,
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
        match &status {
            MultiPartTransactionStatus::Error(msg) => self.errors.push(
                MultiPartTransactionError { block_height, error_message: msg.clone() }),
            MultiPartTransactionStatus::ErrorWithRefundPending(msg) => self.errors.push(
                MultiPartTransactionError { block_height, error_message: msg.clone() }),
            _ => {}
        };

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

    pub fn get_errors(&self) -> Vec<MultiPartTransactionError> {
        self.errors.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    const TEST_ACCOUNT_1: &str = "h4a5i-5vcfo-5rusv-fmb6m-vrkia-mjnkc-jpoow-h5mam-nthnm-ldqlr-bqe";

    #[test]
    fn push_then_take_next() {
        let mut processor = MultiPartTransactionsProcessor::default();
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

        for i in 0..10 {
            processor.push(principal, i, MultiPartTransactionToBeProcessed::StakeNeuron(principal, Memo(i)));
        }

        for i in 0..10 {
            let (block_height, to_be_processed) = processor.take_next().unwrap();
            assert_eq!(block_height, i);
            if let MultiPartTransactionToBeProcessed::StakeNeuron(p, m) = to_be_processed {
                assert_eq!(p, principal);
                assert_eq!(m.0, i);
            }
        }

        assert!(processor.take_next().is_none());
    }

    #[test]
    fn status_updated_correctly() {
        let mut processor = MultiPartTransactionsProcessor::default();
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();

        processor.push(principal, 1, MultiPartTransactionToBeProcessed::StakeNeuron(principal, Memo(0)));
        assert!(matches!(processor.get_status(principal, 1), MultiPartTransactionStatus::Queued));

        processor.update_status(1, MultiPartTransactionStatus::Complete);
        assert!(matches!(processor.get_status(principal, 1), MultiPartTransactionStatus::Complete));
    }

    #[test]
    fn errors_are_stored_when_status_is_updated() {
        let mut processor = MultiPartTransactionsProcessor::default();
        let principal = PrincipalId::from_str(TEST_ACCOUNT_1).unwrap();
        let error_message = "Error!".to_string();

        processor.push(principal, 1, MultiPartTransactionToBeProcessed::StakeNeuron(principal, Memo(0)));
        processor.update_status(1, MultiPartTransactionStatus::Error(error_message.clone()));

        let errors = processor.get_errors();
        assert_eq!(errors[0].block_height, 1);
        assert_eq!(errors[0].error_message, error_message);
    }
}
