//! Boilerplate for implementing traits for the AccountsDb enum.
//!
//! Each function is implemented by calling the same function on the applicable variant.  There is probably a macro for this.
use super::*;

// TODO: This is boilerplate.  can it be eliminated with a macro?
impl AccountsDbTrait for AccountsDb {
    fn schema_label(&self) -> SchemaLabel {
        match &self {
            AccountsDb::Map(map_db) => map_db.schema_label(),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.schema_label()
            }
        }
    }
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        match self {
            AccountsDb::Map(map_db) => map_db.db_insert_account(account_key, account),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_insert_account(account_key, account)
            }
        }
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        match self {
            AccountsDb::Map(map_db) => map_db.db_contains_account(account_key),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_contains_account(account_key)
            }
        }
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        match self {
            AccountsDb::Map(map_db) => map_db.db_get_account(account_key),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_get_account(account_key)
            }
        }
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        match self {
            AccountsDb::Map(map_db) => map_db.db_remove_account(account_key),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_remove_account(account_key)
            }
        }
    }
    fn db_accounts_len(&self) -> u64 {
        match self {
            AccountsDb::Map(map_db) => map_db.db_accounts_len(),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.db_accounts_len()
            }
        }
    }
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        match self {
            AccountsDb::Map(map_db) => map_db.iter(),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => unbounded_stable_btree_map_db.iter(),
        }
    }
    fn range(&self, key_range: impl RangeBounds<Vec<u8>>) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        match self {
            AccountsDb::Map(map_db) => map_db.range(key_range),
            #[cfg(test)]
            AccountsDb::UnboundedStableBTreeMap(unbounded_stable_btree_map_db) => {
                unbounded_stable_btree_map_db.range(key_range)
            }
        }
    }
}
