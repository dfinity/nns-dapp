//! Tests for the S0 schema data storage.
use super::{Account, AccountStorageKey, AccountStoragePage, AccountsDbS0Trait};
use crate::accounts_store::NamedCanister;
use ic_base_types::{CanisterId, PrincipalId};
use icp_ledger::AccountIdentifier;
use std::collections::{BTreeMap, HashMap};

struct MockS0DataStorage {
    accounts_storage: BTreeMap<AccountStorageKey, AccountStoragePage>,
}

impl AccountsDbS0Trait for MockS0DataStorage {
    fn get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.get(account_storage_key).cloned()
    }
    fn insert_account_page(
        &mut self,
        account_storage_key: AccountStorageKey,
        account: AccountStoragePage,
    ) -> Option<AccountStoragePage> {
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
fn toy_account(account_index: u64, num_canisters: u64) -> Account {
    let principal = PrincipalId::new_user_test_id(account_index);
    let account_identifier = AccountIdentifier::from(principal);
    let mut account = Account {
        principal: Some(principal),
        account_identifier,
        default_account_transactions: Vec::new(),
        sub_accounts: HashMap::new(),
        hardware_wallet_accounts: Vec::new(),
        canisters: Vec::new(),
    };
    // Attaches canisters to the account.
    for canister_index in 0..num_canisters {
        let canister_id = CanisterId::from(canister_index);
        let canister = NamedCanister {
            name: format!("canister_{account_index}_{canister_index}"),
            canister_id,
        };
        account.canisters.push(canister);
    }
    // FIN
    account
}

#[test]
fn test_account_storage() {
    let mut storage = MockS0DataStorage {
        accounts_storage: BTreeMap::new(),
    };
    let account_key = vec![1, 2, 3];
    let account = toy_account(1, 5);
    // TODO: Check that this spans several pages.
    storage.insert_account(&account_key, account.clone());
    assert!(storage.contains_account(&account_key));
    assert_eq!(storage.get_account(&account_key), Some(account.clone()));
    let updated_account = toy_account(1, 1000);
    storage.insert_account(&account_key, updated_account.clone());
    assert!(storage.contains_account(&account_key));
    assert_eq!(storage.get_account(&account_key), Some(updated_account.clone()));
    storage.remove_account(&account_key);
    assert!(!storage.contains_account(&account_key));
    assert_eq!(storage.get_account(&account_key), None);
}
