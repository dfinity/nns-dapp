//! Account store constructors.
use super::*;
use ic_stable_structures::{memory_manager::VirtualMemory, DefaultMemoryImpl};

impl AccountsStore {
    pub fn new_with_unbounded_stable_btree_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        dfn_core::api::print("New AccountsStore: AccountsInStableMemory");
        let mut ans = Self::default();
        ans.accounts_db = AccountsDbAsProxy::new_with_unbounded_stable_btree_map(memory);
        ans
    }
}
