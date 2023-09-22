//! Tests for the `S1` schema data storage.
use super::s1::{AccountStorageKey, AccountStoragePage, AccountsDbS1Trait};
use std::collections::BTreeMap;

#[cfg(test)]
mod test_s1;

#[derive(Default)]
struct MockS1DataStorage {
    accounts_storage: BTreeMap<AccountStorageKey, AccountStoragePage>,
}

impl AccountsDbS1Trait for MockS1DataStorage {
    fn s1_get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.get(account_storage_key).cloned()
    }
    fn s1_insert_account_page(
        &mut self,
        account_storage_key: AccountStorageKey,
        account: AccountStoragePage,
    ) -> Option<AccountStoragePage> {
        self.accounts_storage.insert(account_storage_key, account)
    }
    fn s1_contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool {
        self.accounts_storage.contains_key(account_storage_key)
    }
    fn s1_remove_account_page(&mut self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.remove(account_storage_key)
    }
    fn s1_accounts_len(&self) -> u64 {
        self.accounts_storage
            .iter()
            .filter(|(key, _)| key.page_num() == 0)
            .count() as u64
    }
}
