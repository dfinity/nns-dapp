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
    #[must_use]
    pub fn get_queue_length(&self) -> u32 {
        u32::try_from(self.queue.len())
            .unwrap_or_else(|err| unreachable!("MultiPartTransactionsProcessor queue length has length greater than u32::MAX.  Transactions are pruned by the periodic_tasks_runner if they consume more than 1Gb of data, so this should never happen. Error: {:?}", err))
    }
}
