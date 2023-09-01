//! An accounts DB implemented as a hash map.

use super::{Account, AccountsDbTrait};
use std::collections::BTreeMap;
use std::fmt;

#[derive(Default, Eq, PartialEq)]
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

impl AccountsDbAsMap {
    /// Creates a db from a map of accounts.
    pub fn from_map(map: BTreeMap<Vec<u8>, Account>) -> Self {
        Self { accounts: map }
    }
    /// Provides the DB contents as a map.
    pub fn as_map(&self) -> &BTreeMap<Vec<u8>, Account> {
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
    use super::super::tests::test_accounts_db;
    use super::AccountsDbAsMap;

    test_accounts_db!(AccountsDbAsMap::default());
}
