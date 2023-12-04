//! Boilerplate for implementing traits for the AccountsDb enum.
//!
//! Each function is implemented by calling the same function on the applicable variant.  There is probably a macro for this.
use super::*;

impl AccountsDbBTreeMapTrait for AccountsDb {
    fn as_map(&self) -> BTreeMap<Vec<u8>, Account> {
        match self {
            AccountsDb::Map(map_db) => map_db.as_map(),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.as_map()
            }
        }
    }
    fn from_map(map: BTreeMap<Vec<u8>, Account>) -> Self {
        AccountsDb::Map(AccountsDbAsMap::from_map(map))
    }
}

// TODO: This is boilerplate.  can it be eliminated with a macro?
impl AccountsDbTrait for AccountsDb {
    fn schema_label(&self) -> SchemaLabel {
        match &self {
            AccountsDb::Map(map_db) => map_db.schema_label(),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.schema_label()
            }
        }
    }
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        match self {
            AccountsDb::Map(map_db) => map_db.db_insert_account(account_key, account),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_insert_account(account_key, account)
            }
        }
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        match self {
            AccountsDb::Map(map_db) => map_db.db_contains_account(account_key),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_contains_account(account_key)
            }
        }
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        match self {
            AccountsDb::Map(map_db) => map_db.db_get_account(account_key),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_get_account(account_key)
            }
        }
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        match self {
            AccountsDb::Map(map_db) => map_db.db_remove_account(account_key),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_remove_account(account_key)
            }
        }
    }
    fn db_accounts_len(&self) -> u64 {
        match self {
            AccountsDb::Map(map_db) => map_db.db_accounts_len(),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_accounts_len()
            }
        }
    }
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        match self {
            AccountsDb::Map(map_db) => map_db.iter(),
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => unbounded_stable_btree_map_db.iter(),
        }
    }
}
