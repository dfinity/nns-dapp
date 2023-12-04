//! Account store constructors.
use super::*;
use ic_stable_structures::{memory_manager::VirtualMemory, DefaultMemoryImpl};

impl AccountsStore {
    pub fn new_with_unbounded_stable_btree_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        dfn_core::api::print("New AccountsStore: AccountsInStableMemory");
        AccountsStore {
            accounts_db: AccountsDbAsProxy::new_with_unbounded_stable_btree_map(memory),
            ..Default::default()
        }
    }
    pub fn load_unbounded_stable_btree_map(&mut self, memory: VirtualMemory<DefaultMemoryImpl>) {
        dfn_core::api::print("Load AccountsDb: AccountsInStableMemory");
        self.accounts_db = AccountsDbAsProxy::load_with_unbounded_stable_btree_map(memory);
    }
}
