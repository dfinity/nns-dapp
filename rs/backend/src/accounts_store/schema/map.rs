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
    use super::super::tests::test_accounts_db;
    use super::AccountsDbAsMap;

    test_accounts_db!(AccountsDbAsMap::default());
}
