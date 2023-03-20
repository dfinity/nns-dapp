use crate::accounts_store::{CreateCanisterArgs, RefundTransactionArgs, TopUpCanisterArgs};
use candid::CandidType;
use ic_base_types::{CanisterId, PrincipalId};
use icp_ledger::AccountIdentifier;
use icp_ledger::{BlockIndex, Memo};
use serde::Deserialize;
use std::collections::VecDeque;

#[derive(Default, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct MultiPartTransactionsProcessor {
    queue: VecDeque<(BlockIndex, MultiPartTransactionToBeProcessed)>,
}

#[derive(Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub enum MultiPartTransactionToBeProcessed {
    StakeNeuron(PrincipalId, Memo),
    TopUpNeuron(PrincipalId, Memo),
    CreateCanister(CreateCanisterArgs),
    TopUpCanister(TopUpCanisterArgs),
    RefundTransaction(RefundTransactionArgs),
    CreateCanisterV2(PrincipalId),
    TopUpCanisterV2(PrincipalId, CanisterId),
    // ParticipateSwap(buyer_id, from, to, swap_canister_id)
    ParticipateSwap(PrincipalId, AccountIdentifier, AccountIdentifier, CanisterId),
}

impl MultiPartTransactionsProcessor {
    pub fn push(&mut self, block_height: BlockIndex, transaction_to_be_processed: MultiPartTransactionToBeProcessed) {
        self.queue.push_back((block_height, transaction_to_be_processed));
    }

    pub fn take_next(&mut self) -> Option<(BlockIndex, MultiPartTransactionToBeProcessed)> {
        self.queue.pop_front()
    }

    pub fn get_queue_length(&self) -> u32 {
        self.queue.len() as u32
    }

    #[cfg(test)]
    pub fn get_queue_for_testing(&self) -> VecDeque<(BlockIndex, MultiPartTransactionToBeProcessed)> {
        self.queue.clone()
    }

    #[cfg(test)]
    pub fn get_mut_queue_for_testing(&mut self) -> &mut VecDeque<(BlockIndex, MultiPartTransactionToBeProcessed)> {
        &mut self.queue
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
            processor.push(i, MultiPartTransactionToBeProcessed::StakeNeuron(principal, Memo(i)));
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
}
