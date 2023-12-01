//! Mock implementation of the `AccountsInStableMemory` schema data storage.
//!
//! This implementation stores the accounts in a normal `BTreeMap`
//! and does not persist data across upgrades.  The implementation is
//! suitable for unit tests that do not require persistence.

use super::{AccountStorageKey, AccountStoragePage, AccountsInStableMemoryTrait};
use crate::accounts_store::schema::SchemaLabel;
use crate::accounts_store::Account;
use crate::accounts_store::AccountsDbTrait;
use core::ops::Bound;
use std::collections::BTreeMap;

#[cfg(test)]
mod test_accounts_in_stable_memory;

#[cfg(test)]
mod test_db {
    //! Tests for the [`MockS1DataStorage`] implementation of the [`AccountsDbTrait`].
    use super::MockS1DataStorage;
    use crate::accounts_store::schema::tests::test_accounts_db;

    test_accounts_db!(MockS1DataStorage::default());
}

#[derive(Default)]
struct MockS1DataStorage {
    accounts_storage: BTreeMap<AccountStorageKey, AccountStoragePage>,
}

impl AccountsInStableMemoryTrait for MockS1DataStorage {
    fn aism_get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.get(account_storage_key).cloned()
    }
    fn aism_insert_account_page(
        &mut self,
        account_storage_key: AccountStorageKey,
        account: AccountStoragePage,
    ) -> Option<AccountStoragePage> {
        self.accounts_storage.insert(account_storage_key, account)
    }
    fn aism_contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool {
        self.accounts_storage.contains_key(account_storage_key)
    }
    fn aism_remove_account_page(&mut self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.remove(account_storage_key)
    }
    fn aism_accounts_len(&self) -> u64 {
        // TODO: Replace with a stored count.
        self.aism_keys().count() as u64
    }
    fn aism_pages_len(&self) -> u64 {
        self.accounts_storage.len() as u64
    }
    fn aism_get_account_pages(&self, account_key: &[u8]) -> Box<dyn Iterator<Item = AccountStoragePage> + '_> {
        let first_key = AccountStorageKey::new(0, account_key);
        let last_key = AccountStorageKey::new(u16::MAX, account_key);
        let range = (Bound::Included(first_key), Bound::Included(last_key));
        Box::new(self.accounts_storage.range(range).map(|(_k, v)| *v))
    }
    fn aism_keys(&self) -> Box<dyn Iterator<Item = Vec<u8>> + '_> {
        Box::new(
            self.accounts_storage
                .iter()
                .filter(|(key, _)| key.page_num() == 0)
                .map(|(key, _)| key.account_identifier_bytes()),
        )
    }
}

impl AccountsDbTrait for MockS1DataStorage {
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.aism_insert_account(account_key, account)
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.aism_contains_account(account_key)
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.aism_get_account(account_key)
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.aism_remove_account(account_key)
    }
    fn db_accounts_len(&self) -> u64 {
        self.aism_accounts_len()
    }
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        self.aism_iter()
    }
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        self.aism_values()
    }
    /// Note: We use the label for the stable memory version, even though this is a mock
    /// implementation that doesn't persist data in any way.
    fn schema_label(&self) -> SchemaLabel {
        SchemaLabel::AccountsInStableMemory
    }
}
