//! Accounts DB that delegates API calls to underlying implementations.
//!
//! The proxy manages migrations from one implementation to another.
use super::{map::AccountsDbAsMap, Account, AccountsDbBTreeMapTrait, AccountsDbTrait, SchemaLabel};
use crate::accounts_store::schema::accounts_in_unbounded_stable_btree_map::AccountsDbAsUnboundedStableBTreeMap;
use core::fmt;
use core::ops::RangeBounds;
use ic_cdk::println;
use ic_stable_structures::{memory_manager::VirtualMemory, DefaultMemoryImpl};
use std::collections::BTreeMap;

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
    UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap),
}

// Constructors
impl AccountsDbAsProxy {
    pub fn new_with_map() -> Self {
        Self {
            authoritative_db: AccountsDb::Map(AccountsDbAsMap::default()),
            migration: None,
        }
    }
    pub fn new_with_unbounded_stable_btree_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        dfn_core::api::print("New Proxy: AccountsInStableMemory");
        Self {
            authoritative_db: AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::new(memory)),
            migration: None,
        }
    }
    pub fn load_with_unbounded_stable_btree_map(memory: VirtualMemory<DefaultMemoryImpl>) -> Self {
        dfn_core::api::print("Load Proxy: AccountsInStableMemory");
        Self {
            authoritative_db: AccountsDb::UnboundedStableBTreeMap(AccountsDbAsUnboundedStableBTreeMap::load(memory)),
            migration: None,
        }
    }
}

impl AccountsDbAsProxy {
    /// The number of accounts to move per heartbeat.
    pub const MIGRATION_STEP_SIZE: u32 = 10;
    /// The progress meter count reserved for finalizing a migration.
    /// Note: This must be positive and should correspond to a reasonable estimate of the number of blocks needed to complete the migration.
    pub const MIGRATION_FINALIZATION_BLOCKS: u32 = 1;

    /// Migration countdown; when it reaches zero, the migration is complete.
    ///
    /// Note: This is a rough estimate of the number of blocks needed to complete the migration.
    pub fn migration_countdown(&self) -> u32 {
        self.migration.as_ref().map_or(0, |migration| {
            Self::MIGRATION_FINALIZATION_BLOCKS
                + u32::try_from(
                    self.authoritative_db
                        .db_accounts_len()
                        .saturating_sub(migration.db.db_accounts_len()),
                )
                .expect("Huge difference in accounts count")
                    / Self::MIGRATION_STEP_SIZE
        })
    }
    /// Starts a migration, if needed.
    pub fn start_migrating_accounts_to(&mut self, accounts_db: AccountsDb) {
        let migration = Migration {
            db: accounts_db,
            next_to_migrate: self.authoritative_db.iter().next().map(|(key, _account)| key.clone()),
        };
        dfn_core::api::print(format!(
            "Starting account migration: {:?} -> {:?}",
            self.authoritative_db, migration.db
        ));
        self.migration = Some(migration);
    }

    /// Advances the migration by one step.
    pub fn step_migration(&mut self) {
        if let Some(migration) = &mut self.migration {
            if let Some(next_to_migrate) = &migration.next_to_migrate {
                dfn_core::api::print(format!(
                    "Stepping migration: {:?} -> {:?}",
                    self.authoritative_db, migration.db
                ));
                let mut range = self.authoritative_db.range(next_to_migrate.clone()..);
                for (key, account) in (&mut range).take(Self::MIGRATION_STEP_SIZE as usize) {
                    migration.db.db_insert_account(&key, account);
                }
                migration.next_to_migrate = range.next().map(|(key, _account)| key.clone());
            } else {
                self.complete_migration();
            }
        }
    }

    /// Completes any migration in progress.
    pub fn complete_migration(&mut self) {
        if let Some(migration) = self.migration.take() {
            dfn_core::api::print(format!(
                "Account migration complete: {:?} -> {:?}",
                self.authoritative_db, migration.db
            ));
            self.authoritative_db = migration.db;
        }
    }
}

impl AccountsDbAsProxy {
    pub fn from_map(map: BTreeMap<Vec<u8>, Account>) -> Self {
        Self {
            authoritative_db: AccountsDb::Map(AccountsDbAsMap::from_map(map)),
            migration: None,
        }
    }
    pub fn as_map(&self) -> Option<&BTreeMap<Vec<u8>, Account>> {
        match &self.authoritative_db {
            AccountsDb::Map(map_db) => Some(map_db.as_map()),
            AccountsDb::UnboundedStableBTreeMap(_) => None,
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
///
/// TODO: This is needed in tests only.  Disable otherwise.
#[cfg(test)]
impl PartialEq for AccountsDbAsProxy {
    fn eq(&self, other: &Self) -> bool {
        self.authoritative_db.range(..).eq(other.authoritative_db.range(..))
    }
}
#[cfg(test)]
impl Eq for AccountsDbAsProxy {}
