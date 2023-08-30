//! An accounts DB implemented as a hash map.

use super::{Account, AccountsDbTrait};
use std::collections::HashMap;
use std::fmt;

#[derive(Default, Eq, PartialEq)]
pub struct AccountsDbAsMap {
    accounts: HashMap<Vec<u8>, Account>,
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

impl AccountsDbAsMap {
    /// Creates a db from a hash map of accounts.
    pub fn from_map(map: HashMap<Vec<u8>, Account>) -> Self {
        Self { accounts: map }
    }
    /// Provides the DB contents as a hash map.
    pub fn as_map(&self) -> &HashMap<Vec<u8>, Account> {
        &self.accounts
    }
}

impl fmt::Debug for AccountsDbAsMap {
    /// Summarizes the accounts DB contents for debug printouts.
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "AccountsDbAsMap{{... {} entries}}", self.db_accounts_len())
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

    #[test]
    fn map_accounts_db_should_iterate_over_values() {
        generic_tests::assert_iterates_over_values(AccountsDbAsMap::default());
    }
}
