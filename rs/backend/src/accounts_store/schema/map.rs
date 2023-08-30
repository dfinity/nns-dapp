//! An accounts DB implemented as a hash map.

use super::{Account, AccountsDbTrait};
use std::collections::BTreeMap;

#[derive(Default)]
pub struct AccountsDbAsMap {
    accounts: BTreeMap<Vec<u8>, Account>,
}

impl AccountsDbTrait for AccountsDbAsMap {
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.accounts.insert(account_key.to_vec(), account);
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.accounts.contains_key(account_key)
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.accounts.get(account_key).cloned()
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.accounts.remove(account_key);
    }
    fn db_accounts_len(&self) -> u64 {
        self.accounts.len() as u64
    }
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        let iterator = self.accounts.values().cloned();
        Box::new(iterator)
    }
}

#[cfg(test)]
mod tests {
    use super::super::tests as generic_tests;
    use super::AccountsDbAsMap;

    #[test]
    fn map_accounts_db_should_crud() {
        generic_tests::assert_basic_crud_works(AccountsDbAsMap::default());
    }

    #[test]
    fn map_accounts_update_with_happy_path_should_update_account() {
        generic_tests::assert_update_with_happy_path_works(AccountsDbAsMap::default());
    }

    #[test]
    fn map_accounts_update_with_error_path_should_not_change_account() {
        generic_tests::assert_update_not_saved_on_error(AccountsDbAsMap::default());
    }

    #[test]
    fn map_update_with_missing_key_should_return_none() {
        generic_tests::assert_update_with_missing_key_returns_none(AccountsDbAsMap::default());
    }

    #[test]
    fn map_account_counts_should_be_correct() {
        generic_tests::assert_account_count_is_correct(AccountsDbAsMap::default());
    }
}
