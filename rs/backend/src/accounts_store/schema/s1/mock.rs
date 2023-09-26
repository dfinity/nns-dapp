//! Tests for the `S1` schema data storage.
use crate::accounts_store::AccountsDbTrait;
use crate::accounts_store::Account;
use super::{AccountStorageKey, AccountStoragePage, AccountsDbS1Trait};
use std::collections::BTreeMap;

#[cfg(test)]
mod test_s1;

#[cfg(test)]
mod test_db {
    //! Tests for the [`MockS1DataStorage`] implementation of the [`AccountsDbTrait`].
    use crate::accounts_store::schema::tests::test_accounts_db;
    use super::MockS1DataStorage;

    test_accounts_db!(MockS1DataStorage::default());
}


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
        // TODO: Replace with a stored count.
        self.s1_keys()
            .count() as u64
    }
    fn s1_keys(&self) -> Box<dyn Iterator<Item = Vec<u8>> + '_> {
        Box::new(self.accounts_storage
            .iter()
            .filter(|(key, _)| key.page_num() == 0)
            .map(|(key, _)| key.account_identifier_bytes()))
    }
}

impl AccountsDbTrait for MockS1DataStorage {
  fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
      self.s1_insert_account(account_key, account)
  }
  fn db_contains_account(&self, account_key: &[u8]) -> bool {
      self.s1_contains_account(account_key)
  }
  fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
      self.s1_get_account(account_key)
  }
  fn db_remove_account(&mut self, account_key: &[u8]) {
      self.s1_remove_account(account_key)
  }
  fn db_accounts_len(&self) -> u64 {
      self.s1_accounts_len()
  }
  fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
      self.s1_values()
  }
}
