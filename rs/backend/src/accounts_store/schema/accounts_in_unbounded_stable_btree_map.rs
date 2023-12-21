//! Data storage schema `AccountsInStableMemory`: Accounts data is stored in a `StableBTreeMap`,
//! other data is on the heap and serialized in `pre_upgrade` hooks.
//!
//! Data is stored in a [`ic_stable_structures::btreemap::BTreeMap`](https://docs.rs/ic-stable-structures/0.6.0/ic_stable_structures/btreemap/struct.BTreeMap.html)
//! with values that are [`ic_stable_structures::storable::Bound::Unbounded`](https://docs.rs/ic-stable-structures/0.6.0/ic_stable_structures/storable/enum.Bound.html#variant.Unbounded)
//! as described on the [dfinity forum](https://forum.dfinity.org/t/stable-structures-removing-the-bounded-size-requirement/21167).

use super::{Account, AccountsDbTrait, SchemaLabel};
use core::ops::RangeBounds;
#[cfg(test)]
use ic_stable_structures::DefaultMemoryImpl;
use ic_stable_structures::{btreemap::BTreeMap as StableBTreeMap, Memory};
#[cfg(test)]
use std::collections::BTreeMap as StdBTreeMap;
#[cfg(test)]
use ic_stable_structures::memory_manager::VirtualMemory;
use std::fmt;

#[cfg(test)]
pub type ProductionMemoryType = VirtualMemory<DefaultMemoryImpl>;

pub struct AccountsDbAsUnboundedStableBTreeMap<M>
where
    M: Memory,
{
    accounts: StableBTreeMap<Vec<u8>, Account, M>,
}

impl<M> AccountsDbAsUnboundedStableBTreeMap<M>
where
    M: Memory,
{
    /// Creates a new, empty database.
    #[cfg(test)]
    pub fn new(memory: M) -> Self {
        Self {
            accounts: StableBTreeMap::new(memory),
        }
    }
    /// Loads a database.
    #[cfg(test)]
    pub fn load(memory: M) -> Self {
        Self {
            accounts: StableBTreeMap::load(memory),
        }
    }
}

#[cfg(test)]
impl Default for AccountsDbAsUnboundedStableBTreeMap<DefaultMemoryImpl> {
    fn default() -> Self {
        Self::new(DefaultMemoryImpl::default())
    }
}

impl<M> AccountsDbTrait for AccountsDbAsUnboundedStableBTreeMap<M>
where
    M: Memory,
{
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.accounts.insert(account_key.to_vec(), account);
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.accounts.contains_key(&account_key.to_vec())
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.accounts.get(&account_key.to_vec()) // TODO: Change the trait to &Vec.
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.accounts.remove(&account_key.to_vec());
    }
    fn db_accounts_len(&self) -> u64 {
        self.accounts.len()
    }
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        let iterator = self.accounts.iter();
        Box::new(iterator)
    }
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        let iterator = self.accounts.iter().map(|(_key, value)| value);
        Box::new(iterator)
    }
    fn range(&self, key_range: impl RangeBounds<Vec<u8>>) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        let iterator = self.accounts.range(key_range);
        Box::new(iterator)
    }
    fn schema_label(&self) -> SchemaLabel {
        SchemaLabel::AccountsInStableMemory
    }
}

impl<M> fmt::Debug for AccountsDbAsUnboundedStableBTreeMap<M>
where
    M: Memory,
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        write!(
            f,
            "AccountsDbAsUnboundedStableBTreeMap {{ accounts: StableBTreeMap{{.. {} entries}} }}",
            self.accounts.len()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::super::tests::test_accounts_db;
    use super::AccountsDbAsUnboundedStableBTreeMap;
    use super::*;
    use crate::accounts_store::schema::tests::toy_account;
    use crate::accounts_store::schema::AccountsDbTrait;
    use ic_stable_structures::memory_manager::{MemoryId, MemoryManager};

    // Test that the AccountsDbTrait implementation works.
    test_accounts_db!(AccountsDbAsUnboundedStableBTreeMap::default());

    #[test]
    fn should_be_able_to_load_existing_database() {
        // Prepare a virtual memory, as in production.
        let raw_memory = DefaultMemoryImpl::default();
        raw_memory.grow(5);
        let memory_manager = MemoryManager::init(raw_memory);
        let random_memory_id = MemoryId::new(9);
        // ... and some accounts to store.
        let accounts: StdBTreeMap<_, _> = vec![(b"key"[..].to_owned(), toy_account(1, 2))].into_iter().collect();
        // Store the accounts in a new database.
        let mut new_db = AccountsDbAsUnboundedStableBTreeMap::new(memory_manager.get(random_memory_id));
        for (key, account) in accounts.iter() {
            new_db.db_insert_account(&key, account.clone());
        }
        let new_accounts: StdBTreeMap<_, _> = new_db.range(..).collect();
        assert_eq!(accounts, new_accounts, "Failed to store accounts in new database.");
        // Load the accounts from a new database using the same memory.
        let loaded_db = AccountsDbAsUnboundedStableBTreeMap::load(memory_manager.get(random_memory_id));
        let loaded_accounts: StdBTreeMap<_, _> = loaded_db.range(..).collect();
        assert_eq!(
            new_accounts, loaded_accounts,
            "Failed to load accounts from existing stable memory."
        );
    }
}
