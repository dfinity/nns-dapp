//! Tests for the [`MockS1DataStorage`] implementation of the [`AccountsInStableMemoryTrait`].
use super::super::{AccountStorageKey, AccountStoragePage, AccountsInStableMemoryTrait};
use super::MockS1DataStorage;
use crate::accounts_store::toy_data::{toy_account, ToyAccountSize};
use crate::accounts_store::Account;
use std::collections::BTreeMap;

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
    let size = ToyAccountSize {
        sub_accounts: 255,
        canisters: 511,
        default_account_transactions: 8191,
        sub_account_transactions: 16383 / 255, // TODO: The histogram does not give the total number of transactions across sub-accounts.
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
    assert!(
        num_pages > 1,
        "A large test account should use several pages of memory but has only: {}",
        num_pages
    );
    assert!(
        num_pages <= MockS1DataStorage::MAX_PAGES_PER_ACCOUNT,
        "A large test account should not exceed the maximum number of pages: {}",
        num_pages
    );
}

#[test]
fn tiny_account_uses_one_page() {
    let yo = tiny_account(1);
    let num_pages = AccountStoragePage::pages_from_account(&yo).len();
    assert_eq!(
        1, num_pages,
        "A small account should fit into one page of memory: {}",
        num_pages
    );
}

#[test]
fn test_account_storage() {
    let mut storage = MockS1DataStorage {
        accounts_storage: BTreeMap::new(),
    };
    assert_eq!(storage.aism_accounts_len(), 0, "Expected to have no accounts initially");

    // Inserts the first account
    let account_key = vec![1, 2, 3];
    let account = tiny_account(1);
    storage.aism_insert_account(&account_key, account.clone());
    assert_eq!(
        storage.aism_accounts_len(),
        1,
        "Expected to have one account after the first insertion"
    );
    assert_eq!(
        storage.aism_pages_len(),
        1,
        "Expected to be using one page after inserting a tiny account."
    );
    assert!(storage.aism_contains_account(&account_key));
    assert_eq!(storage.aism_get_account(&account_key), Some(account.clone()));

    // Updates the account to a large one that uses lots of pages
    let updated_account = large_account(1);
    storage.aism_insert_account(&account_key, updated_account.clone());
    assert_eq!(
        storage.aism_accounts_len(),
        1,
        "Expected to still have one account after updating the account"
    );
    assert!(storage.aism_contains_account(&account_key));
    assert_eq!(storage.aism_get_account(&account_key), Some(updated_account.clone()));
    assert!(
        storage.aism_pages_len() > 1,
        "Expected the large account to consume multiple pages."
    );

    // Updates the account to a small one that consumes just one page
    storage.aism_insert_account(&account_key, account.clone());
    assert_eq!(
        storage.aism_pages_len(),
        1,
        "Expected to be using one page after reducing the account to a tiny size"
    );

    // Deletes the account
    storage.aism_remove_account(&account_key);
    assert!(!storage.aism_contains_account(&account_key));
    assert_eq!(
        storage.aism_get_account(&account_key),
        None,
        "Expected not to be able to retrieve a deleted account."
    );
    assert_eq!(
        storage.aism_pages_len(),
        0,
        "Expected to be using no pages after deleting the only account."
    );
}

/// We assume that new account identifiers are 32 bytes long.
///
/// Note: Old-style account identifiers were 28 bytes long.
#[test]
fn account_identifier_has_32_bytes() {
    let account_identifier = icp_ledger::AccountIdentifier::from(ic_base_types::PrincipalId::new_user_test_id(99));
    assert_eq!(
        account_identifier.to_vec().len(),
        AccountStorageKey::ACCOUNT_IDENTIFIER_MAX_BYTES
    );
}
