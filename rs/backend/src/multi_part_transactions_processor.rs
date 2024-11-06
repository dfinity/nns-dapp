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
    CreateCanisterV2(PrincipalId),
    TopUpCanisterV2(PrincipalId, CanisterId),
    // ParticipateSwap(buyer_id, from, to, swap_canister_id)
    ParticipateSwap(PrincipalId, AccountIdentifier, AccountIdentifier, CanisterId),
}

impl MultiPartTransactionsProcessor {
    pub fn push(&mut self, block_height: BlockIndex, transaction_to_be_processed: MultiPartTransactionToBeProcessed) {
        self.queue.push_back((block_height, transaction_to_be_processed));
    }

    #[must_use]
    pub fn take_next(&mut self) -> Option<(BlockIndex, MultiPartTransactionToBeProcessed)> {
        self.queue.pop_front()
    }

    #[must_use]
    pub fn get_queue_length(&self) -> u32 {
        u32::try_from(self.queue.len())
            .unwrap_or_else(|err| unreachable!("MultiPartTransactionsProcessor queue length has length greater than u32::MAX.  Transactions are pruned by the periodic_tasks_runner if they consume more than 1Gb of data, so this should never happen. Error: {:?}", err))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;
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
