//! Tests for the `S1` schema data storage.
use super::{Account, AccountStorageKey, AccountStoragePage, AccountsDbS1Trait};
use crate::accounts_store::NamedCanister;
use ic_base_types::{CanisterId, PrincipalId};
use icp_ledger::AccountIdentifier;
use std::collections::{BTreeMap, HashMap};

struct MockS1DataStorage {
    accounts_storage: BTreeMap<AccountStorageKey, AccountStoragePage>,
}

impl AccountsDbS1Trait for MockS1DataStorage {
    fn s1_get_account_page(&self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.get(account_storage_key).cloned()
    }
    fn s1_insert_account_page(
        &mut self,
        account_storage_key: AccountStorageKey,
        account: AccountStoragePage,
    ) -> Option<AccountStoragePage> {
        self.accounts_storage.insert(account_storage_key, account)
    }
    fn s1_contains_account_page(&self, account_storage_key: &AccountStorageKey) -> bool {
        self.accounts_storage.contains_key(account_storage_key)
    }
    fn s1_remove_account_page(&mut self, account_storage_key: &AccountStorageKey) -> Option<AccountStoragePage> {
        self.accounts_storage.remove(account_storage_key)
    }
    fn s1_accounts_len(&self) -> u64 {
        self.accounts_storage
            .iter()
            .filter(|(key, _)| key.page_num() == 0)
            .count() as u64
    }
}

/// A specification for how large a toy account should be.
#[derive(Default)]
struct ToyAccountSize {
  sub_accounts: usize,
  canisters: usize,
  default_account_transactions: usize,
  sub_account_transactions: usize,
  hardware_wallets: usize,
}

/// Creates a toy account.  The contents do not need to be meaningful; do need to have size.
fn toy_account(account_index: u64, size: ToyAccountSize) -> Account {
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
    for canister_index in 0..size.canisters {
        let canister_id = CanisterId::from(canister_index as u64);
        let canister = NamedCanister {
            name: format!("canister_{account_index}_{canister_index}"),
            canister_id,
        };
        account.canisters.push(canister);
    }
    // FIN
    account
}

/// Creates a large account that should be spread over multiple memory pages.
///
/// Note: In production we have histograms that can help us estimate the maximum size that we need
/// to support.
/// - sub-accounts: 255
/// - canisters: 511
/// - default account transactions: 8191
/// - sub-account transactions: 16383
/// - hardware wallets: 63
fn large_account(account_index: u64) -> Account {
    let size = ToyAccountSize{
        sub_accounts: 255,
        canisters: 511,
        default_account_transactions: 8191,
        sub_account_transactions: 16383,
        hardware_wallets: 63,
    };
  toy_account(account_index, size)
}

/// Creates a tiny account with minimal activity.
fn tiny_account(account_index: u64) -> Account {
    let size = ToyAccountSize::default();
  toy_account(account_index, size)
}

#[test]
fn large_account_uses_several_pages() {
  let yo = large_account(1);
  let num_pages = AccountStoragePage::pages_from_account(&yo).len();
  assert!(num_pages > 1, "A large test account should use several pages of memory but has only: {}", num_pages);
  assert!(num_pages <= MockS1DataStorage::MAX_PAGES_PER_ACCOUNT, "A large test account should not exceed the maximum number of pages: {}", num_pages);
}

#[test]
fn test_account_storage() {
    let mut storage = MockS1DataStorage {
        accounts_storage: BTreeMap::new(),
    };
    let account_key = vec![1, 2, 3];
    let account = tiny_account(1);
    // TODO: Check that this spans several pages.
    storage.s1_insert_account(&account_key, account.clone());
    assert!(storage.s1_contains_account(&account_key));
    assert_eq!(storage.s1_get_account(&account_key), Some(account.clone()));
    let updated_account = large_account(1);
    storage.s1_insert_account(&account_key, updated_account.clone());
    assert!(storage.s1_contains_account(&account_key));
    assert_eq!(storage.s1_get_account(&account_key), Some(updated_account.clone()));
    storage.s1_remove_account(&account_key);
    assert!(!storage.s1_contains_account(&account_key));
    assert_eq!(storage.s1_get_account(&account_key), None);
}

/// We assume that new account identifiers are 32 bytes long.
///
/// Note: Old-style account identifiers were 28 bytes long.
#[test]
fn account_identifier_has_32_bytes() {
    let account_identifier = icp_ledger::AccountIdentifier::from(ic_base_types::PrincipalId::new_user_test_id(99));
    assert_eq!(account_identifier.to_vec().len(), 32);
}
