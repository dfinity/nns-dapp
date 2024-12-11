use candid::CandidType;
use ic_base_types::PrincipalId;
use icp_ledger::BlockIndex;
use serde::Deserialize;
use std::collections::VecDeque;

#[derive(Default, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub struct MultiPartTransactionsProcessor {
    queue: VecDeque<(BlockIndex, MultiPartTransactionToBeProcessed)>,
}

#[derive(Clone, CandidType, Deserialize, Debug, Eq, PartialEq)]
pub enum MultiPartTransactionToBeProcessed {
    CreateCanisterV2(PrincipalId),
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
            processor.push(i, MultiPartTransactionToBeProcessed::CreateCanisterV2(principal));
        }

        for i in 0..10 {
            let (block_height, to_be_processed) = processor.take_next().unwrap();
            assert_eq!(block_height, i);
            if let MultiPartTransactionToBeProcessed::CreateCanisterV2(p) = to_be_processed {
                assert_eq!(p, principal);
            }
        }

        assert!(processor.take_next().is_none());
    }
}
