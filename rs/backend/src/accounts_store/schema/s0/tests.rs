//! Tests for the S0 schema data storage.
use super::{AccountStorageTrait, Account, AccountStorageKey, AccountStoragePage};
use icp_ledger::AccountIdentifier;
use std::collections::{BTreeMap, HashMap};
use ic_base_types::PrincipalId;

struct MockS0DataStorage {
    accounts_storage: BTreeMap<AccountStorageKey, AccountStoragePage>,
}

impl AccountStorageTrait for MockS0DataStorage {
    fn get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.get(account_storage_key).cloned()
    }
    fn insert_account_page(&mut self, account_storage_key: AccountStorageKey, account: AccountStoragePage) -> Option<AccountStoragePage> {
        self.accounts_storage.insert(account_storage_key, account)
    }
    fn contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool {
        self.accounts_storage.contains_key(account_storage_key)
    }
    fn remove_account_page(&mut self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.remove(account_storage_key)
    }
}

/// Creates atoy account.  The contents do not need to be meaningful; do need to have size.
fn toy_account() -> Account {
    let principal = PrincipalId::new_user_test_id(1);
    let account_identifier = AccountIdentifier::from(principal);
    Account {
        principal: Some(principal),
        account_identifier,
        default_account_transactions: Vec::new(),
        sub_accounts: HashMap::new(),
        hardware_wallet_accounts: Vec::new(),
        canisters: Vec::new(),
    }
}

#[test]
fn test_account_storage() {
    let mut storage = MockS0DataStorage {
        accounts_storage: BTreeMap::new(),
    };
    let account_key = vec![1, 2, 3];
    let account = toy_account();
    storage.insert_account(&account_key, account.clone());
    assert_eq!(storage.contains_account(&account_key), true);
    assert_eq!(storage.get_account(&account_key), Some(account.clone()));
    storage.remove_account(&account_key);
    assert_eq!(storage.contains_account(&account_key), false);
    assert_eq!(storage.get_account(&account_key), None);
}