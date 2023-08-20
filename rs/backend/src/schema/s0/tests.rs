//! Tests for the S0 schema data storage.
use super::AccountStorageTrait;

struct MockS0DataStorage {
    accounts_storage: BTreeMap<AccountStorageKey, AccountStoragePage>,
}

impl AccountStorageTrait for MockS0DataStorage {
    fn get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.get(account_storage_key).cloned()
    }
    fn insert_account_page(&mut self, account_storage_key: AccountStorageKey, account: AccountStoragePage) {
        self.accounts_storage.insert(account_storage_key, account);
    }
    fn contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool {
        self.accounts_storage.contains_key(account_storage_key)
    }
    fn remove_account_page(&mut self, account_storage_key: &AccountStorageKey) {
        self.accounts_storage.remove(account_storage_key);
    }
}