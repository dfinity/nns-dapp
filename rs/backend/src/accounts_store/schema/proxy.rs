//! Accounts DB that delegates API calls to underlying implementations.
//!
//! The proxy manages migrations from one implementation to another.
use std::collections::BTreeMap;

use super::{map::AccountsDbAsMap, Account, AccountsDbTrait};

/// An accounts database delegates API calls to underlying implementations.
///
/// Notes:
/// - The proxy manages migrations from one implementation to another, if applicable.
/// - The proxy code itself will specify which databases are currently in
///   use and how to migrate from one database to another.
/// - It is the responsibility of the post-install hook to look at any
///   version information and set up the db accordingly.
///
/// # Current data storage
/// - Accounts are 
#[derive(Default, Debug)]
pub struct AccountsDbAsProxy {
    map: AccountsDbAsMap,
}

impl AccountsDbAsProxy {
    /// Creates a db from a hash map of accounts.
    pub fn from_map(map: BTreeMap<Vec<u8>, Account>) -> Self {
        Self {
            map: AccountsDbAsMap::from_map(map),
        }
    }
    /// Provides the DB contents as a hash map.
    pub fn as_map(&self) -> &BTreeMap<Vec<u8>, Account> {
        self.map.as_map()
    }
}

impl AccountsDbTrait for AccountsDbAsProxy {
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.map.db_insert_account(account_key, account);
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.map.db_contains_account(account_key)
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.map.db_get_account(account_key)
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.map.db_remove_account(account_key);
    }
    fn db_accounts_len(&self) -> u64 {
        self.map.db_accounts_len()
    }
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        self.map.values()
    }
}

/// Check whether two account databases contain the same data.
///
/// It should be possible to use this to confirm that data has been preserved during a migration.
impl PartialEq for AccountsDbAsProxy {
    fn eq(&self, other: &Self) -> bool {
        self.map == other.map
    }
}
impl Eq for AccountsDbAsProxy {}

#[cfg(test)]
mod tests {
    use super::AccountsDbAsProxy;
    use super::super::tests::test_accounts_db;

    test_accounts_db!(AccountsDbAsProxy::default());
}
