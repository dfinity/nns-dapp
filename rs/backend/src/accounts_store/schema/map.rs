//! An accounts DB implemented as a hash map.

use super::{Account, AccountsDbBTreeMapTrait, AccountsDbTrait, SchemaLabel};
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
    fn iter(&self) -> Box<dyn Iterator<Item = (Vec<u8>, Account)> + '_> {
        let iterator = self.accounts.iter().map(|(key, val)| (key.clone(), val.clone()));
        Box::new(iterator)
    }
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_> {
        let iterator = self.accounts.values().cloned();
        Box::new(iterator)
    }
    fn schema_label(&self) -> SchemaLabel {
        SchemaLabel::Map
    }
}

impl AccountsDbBTreeMapTrait for AccountsDbAsMap {
    fn from_map(map: BTreeMap<Vec<u8>, Account>) -> Self {
        Self { accounts: map }
    }
    fn as_map(&self) -> BTreeMap<Vec<u8>, Account> {
        self.accounts.clone()
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
    use super::super::tests::{assert_map_conversions_work, test_accounts_db};
    use super::AccountsDbAsMap;

    test_accounts_db!(AccountsDbAsMap::default());

    #[test]
    fn map_conversions_should_work() {
        assert_map_conversions_work::<AccountsDbAsMap>();
    }
}
