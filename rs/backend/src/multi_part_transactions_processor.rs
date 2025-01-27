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
