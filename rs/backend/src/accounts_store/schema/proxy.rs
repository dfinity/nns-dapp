//! Accounts DB that delegates API calls to underlying implementations.
//!
//! The proxy manages migrations from one implementation to another.
use super::accounts_in_unbounded_stable_btree_map::{AccountsDbAsUnboundedStableBTreeMap, ProductionMemoryType};
use super::{map::AccountsDbAsMap, Account, AccountsDbTrait};
use core::ops::RangeBounds;

mod enum_boilerplate;

/// An accounts database delegates API calls to underlying implementations.
///
/// TODO: delete this entirely, since the migration logic is removed and the delegation is
/// unnecessary.
#[derive(Debug)]
pub struct AccountsDbAsProxy {
    authoritative_db: AccountsDb,
}

impl Default for AccountsDbAsProxy {
    fn default() -> Self {
        AccountsDb::Map(AccountsDbAsMap::default()).into()
    }
}

impl From<AccountsDb> for AccountsDbAsProxy {
    fn from(db: AccountsDb) -> Self {
        AccountsDbAsProxy { authoritative_db: db }
    }
}

#[derive(Debug)]
pub enum AccountsDb {
    Map(AccountsDbAsMap),
    UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap<ProductionMemoryType>),
}

impl AccountsDbTrait for AccountsDbAsProxy {
    /// Inserts into all the underlying databases.
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.authoritative_db.db_insert_account(account_key, account.clone());
    }
    /// Checks the authoritative database.
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.authoritative_db.db_contains_account(account_key)
    }
    /// Gets an account from the authoritative database.
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.authoritative_db.db_get_account(account_key)
    }
    /// Removes an account from all underlying databases.
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.authoritative_db.db_remove_account(account_key);
    }
    /// Gets the length from the authoritative database.
    fn db_accounts_len(&self) -> u64 {
        self.authoritative_db.db_accounts_len()
    }
    /// Iterates over the entries of the authoritative database.
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        self.authoritative_db.iter()
    }
    /// Gets the first key-value pair in the authoritative database.
    fn first_key_value(&self) -> Option<(Vec<u8>, Account)> {
        self.authoritative_db.first_key_value()
    }
    /// Gets the last key-value pair in the authoritative database.
    fn last_key_value(&self) -> Option<(Vec<u8>, Account)> {
        self.authoritative_db.last_key_value()
    }
    /// Iterates over the values of the authoritative database.
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        self.authoritative_db.values()
    }
    /// Iterates over a range of accounts in the authoritative db.
    fn range(&self, key_range: impl RangeBounds<Vec<u8>>) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        self.authoritative_db.range(key_range)
    }
}

/// Check whether two account databases contain the same data.
///
/// It should be possible to use this to confirm that data has been preserved during a migration.
#[cfg(test)]
impl PartialEq for AccountsDbAsProxy {
    fn eq(&self, other: &Self) -> bool {
        self.authoritative_db.range(..).eq(other.authoritative_db.range(..))
    }
}
#[cfg(test)]
impl Eq for AccountsDbAsProxy {}
