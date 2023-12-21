//! Accounts DB that delegates API calls to underlying implementations.
//!
//! The proxy manages migrations from one implementation to another.
use super::{map::AccountsDbAsMap, Account, AccountsDbBTreeMapTrait, AccountsDbTrait, SchemaLabel};
use core::fmt;
use core::ops::RangeBounds;
use ic_cdk::println;
use std::collections::BTreeMap;
#[cfg(test)]
use super::accounts_in_unbounded_stable_btree_map::{AccountsDbAsUnboundedStableBTreeMap, ProductionMemoryType};
#[cfg(test)]
use ic_stable_structures::{DefaultMemoryImpl, memory_manager::VirtualMemory};

mod enum_boilerplate;
mod migration;
#[cfg(test)]
mod tests;

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
/// - Accounts are stored as a map.  No migrations are undertaken.
#[derive(Debug)]
pub struct AccountsDbAsProxy {
    authoritative_db: AccountsDb,
    migration: Option<Migration>,
}

impl Default for AccountsDbAsProxy {
    fn default() -> Self {
        Self::new_with_map()
    }
}

struct Migration {
    /// The database being migrated to
    db: AccountsDb,
    /// The next account to migrate.
    #[cfg(test)]
    next_to_migrate: Option<Vec<u8>>,
}

impl fmt::Debug for Migration {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // Note: The `next_to_migrate` field is rarely interesting so is omitted.
        //       The database type and number of entries suffices.
        self.db.fmt(f)
    }
}

#[derive(Debug)]
pub enum AccountsDb {
    Map(AccountsDbAsMap),
    #[cfg(test)]
    UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap<ProductionMemoryType>),
}

// Constructors
impl AccountsDbAsProxy {
    /// Creates a new proxy using a map as the underlying storage.
    pub fn new_with_map() -> Self {
        Self {
            authoritative_db: AccountsDb::Map(AccountsDbAsMap::default()),
            migration: None,
        }
    }
    pub fn from_map(map: BTreeMap<Vec<u8>, Account>) -> Self {
        Self {
            authoritative_db: AccountsDb::Map(AccountsDbAsMap::from_map(map)),
            migration: None,
        }
    }
    /// Provides a reference to the underlying map, if that is how accounts are stored.
    pub fn as_map_maybe(&self) -> Option<&BTreeMap<Vec<u8>, Account>> {
        match &self.authoritative_db {
            AccountsDb::Map(map_db) => Some(map_db.as_map()),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(_) => None,
        }
    }
    #[cfg(test)]
    pub fn new_with_unbounded_stable_btree_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        println!("New Proxy: AccountsInStableMemory");
        Self {
            authoritative_db: AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::new(memory)),
            migration: None,
        }
    }
    #[cfg(test)]
    pub fn load_with_unbounded_stable_btree_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        println!("Load Proxy: AccountsInStableMemory");
        Self {
            authoritative_db: AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::load(memory)),
            migration: None,
        }
    }
}

impl AccountsDbTrait for AccountsDbAsProxy {
    /// Inserts into all the underlying databases.
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.authoritative_db.db_insert_account(account_key, account.clone());
        if let Some(migration) = &mut self.migration {
            migration.db.db_insert_account(account_key, account);
        }
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
        if let Some(migration) = self.migration.as_mut() {
            migration.db.db_remove_account(account_key);
        }
    }
    /// Gets the length from the authoritative database.
    fn db_accounts_len(&self) -> u64 {
        self.authoritative_db.db_accounts_len()
    }
    /// Iterates over the entries of the authoritative database.
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        self.authoritative_db.iter()
    }
    /// Iterates over the values of the authoritative database.
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        self.authoritative_db.values()
    }
    /// The authoritative schema label.
    fn schema_label(&self) -> SchemaLabel {
        let schema_label = self.authoritative_db.schema_label();
        println!("AccountsDb::Proxy: authoritative schema label: {schema_label:#?}");
        schema_label
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
