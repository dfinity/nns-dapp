//! Account store constructors.
use ic_stable_structures::{DefaultMemoryImpl, memory_manager::VirtualMemory};
use super::*;

impl AccountsStore {
    pub fn new_with_unbounded_stable_btree_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        let mut ans = Self::default();
        ans.accounts_db = AccountsDbAsProxy::new_with_unbounded_stable_btree_map(memory);
        ans
    }
}