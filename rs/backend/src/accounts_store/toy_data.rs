//! Test data for unit tests and test networks.

use crate::accounts_store::{
    schema::AccountsDbTrait, Account, AccountsStore, AttachCanisterRequest, CanisterId, PrincipalId,
    RegisterHardwareWalletRequest,
};

#[cfg(test)]
use crate::accounts_store::AccountIdentifier;

#[cfg(test)]
use std::collections::HashMap;

#[cfg(test)]
use crate::accounts_store::{convert_byte_to_sub_account, NamedCanister, NamedHardwareWalletAccount, NamedSubAccount};

const MAX_SUB_ACCOUNTS_PER_ACCOUNT: u64 = 3; // Toy accounts have between 0 and this many subaccounts.
const MAX_HARDWARE_WALLETS_PER_ACCOUNT: u64 = 1; // Toy accounts have between 0 and this many hardware wallets.
const MAX_CANISTERS_PER_ACCOUNT: u64 = 2; // Toy accounts have between 0 and this many canisters.

/// A specification for how large a toy account should be.
///
/// Note: The keys correspond to those in the `AccountsStoreHistogram`.
#[derive(Default, Debug, Copy, Clone, Eq, PartialEq)]
pub struct ToyAccountSize {
    /// The number of sub-accounts
    pub sub_accounts: usize,
    /// The number of canisters
    pub canisters: usize,
    /// The number of hardware wallets.
    pub hardware_wallets: usize,
}

impl From<&Account> for ToyAccountSize {
    fn from(account: &Account) -> Self {
        let sub_accounts = account.sub_accounts.len();
        let canisters = account.canisters.len();
        let hardware_wallets = account.hardware_wallet_accounts.len();
        ToyAccountSize {
            sub_accounts,
            canisters,
            hardware_wallets,
        }
    }
}

/// Creates a toy account data structure.
///
/// Warning: The meaning of the data in the account is in no way coherent or semantically
/// correct.
//
// TODO: Delete the `toy_account()` function in rs/backend/src/accounts_store/schema/tests.rs and
// use this instead.
#[cfg(test)]
pub fn toy_account(account_index: u64, size: ToyAccountSize) -> Account {
    let principal = PrincipalId::new_user_test_id(account_index);
    let account_identifier = AccountIdentifier::from(principal);
    let mut account = Account {
        principal: Some(principal),
        account_identifier,
        sub_accounts: HashMap::new(),
        hardware_wallet_accounts: Vec::new(),
        canisters: Vec::new(),
        imported_tokens: None,
    };
    // Creates linked sub-accounts:
    // Note: Successive accounts have 0, 1, 2 ... MAX_SUB_ACCOUNTS_PER_ACCOUNT-1 sub accounts, restarting at 0.
    for sub_account_index in 0..size.sub_accounts as u8 {
        let sub_account_name = format!("sub_account_{account_index}_{sub_account_index}");
        let sub_account = convert_byte_to_sub_account(sub_account_index);
        let sub_account_identifier = AccountIdentifier::new(principal, Some(sub_account));
        let named_sub_account = NamedSubAccount::new(sub_account_name.clone(), sub_account_identifier);
        account.sub_accounts.insert(sub_account_index, named_sub_account);
    }
    // Attaches canisters to the account.
    for canister_index in 0..size.canisters {
        let canister_id = CanisterId::from(canister_index as u64);
        let canister = NamedCanister {
            name: format!("canister_{account_index}_{canister_index}"),
            canister_id,
            block_index: Some(123),
        };
        account.canisters.push(canister);
    }
    for hardware_wallet_index in 0..size.hardware_wallets as u64 {
        // Note: The principal is currently unused but in case it is used in future tests we make a
        // modest attempt to avoid collisions by:
        //
        // * Avoiding small numbers, as they may appear in other tests.
        // * Avoiding collisions between principals generated in this way; a user will need a
        //   million hardware wallets before we can have a collision.
        let principal = PrincipalId::new_user_test_id(account_index * 1_000_000 + hardware_wallet_index + 100_000); // Toy hardware wallet principal.
        let hardware_wallet = NamedHardwareWalletAccount {
            name: format!("hw_wallet_{account_index}_{hardware_wallet_index}"),
            principal,
        };
        account.hardware_wallet_accounts.push(hardware_wallet);
    }

    // FIN
    account
}

#[test]
fn toy_account_should_have_the_requested_size() {
    let requested_size = ToyAccountSize {
        sub_accounts: 1,
        canisters: 2,
        hardware_wallets: 5,
    };
    let account = toy_account(9, requested_size);
    let actual_size = ToyAccountSize::from(&account);
    assert_eq!(requested_size, actual_size);
}

impl AccountsStore {
    /// Creates the given number of toy accounts, with linked sub-accounts, hardware wallets, pending transactions, and canisters.
    ///
    /// Note: The account is created with `AccountsStore` API calls, so the `AccountsStore` should
    /// be internally consistent, however the data is not expected to be consistent with other
    /// canisters.  For example, account IDs can be complete nonsense compared with ledger data.
    ///
    /// # Returns
    /// - The index of the first account created by this call.  The account indices are `first...first+num_accounts-1`.
    pub fn create_toy_accounts(&mut self, num_accounts: u64) -> u64 {
        // If we call this function twice, we don't want to create the same accounts again, so we index from the number of existing accounts.
        let num_existing_accounts = self.accounts_db.db_accounts_len();
        let (index_range_start, index_range_end) = (num_existing_accounts, (num_existing_accounts + num_accounts));
        // Creates accounts:
        for toy_account_index in index_range_start..index_range_end {
            let account = PrincipalId::new_user_test_id(toy_account_index);
            self.add_account(account);
            // Creates linked sub-accounts:
            // Note: Successive accounts have 0, 1, 2 ... MAX_SUB_ACCOUNTS_PER_ACCOUNT-1 sub accounts, restarting at 0.
            for subaccount_index in 0..(toy_account_index % (MAX_SUB_ACCOUNTS_PER_ACCOUNT + 1)) {
                self.create_sub_account(account, format!("sub_account_{toy_account_index}_{subaccount_index}"));
            }
            // Creates linked hardware wallets:
            // Note: Successive accounts have 0, 1, 2 ... MAX_HARDWARE_WALLETS_PER_ACCOUNT-1 hardware wallets, restarting at 0.
            for hardware_wallet_index in 0..(toy_account_index % (MAX_HARDWARE_WALLETS_PER_ACCOUNT + 1)) {
                let principal = PrincipalId::new_user_test_id(toy_account_index + hardware_wallet_index + 999); // Toy hardware wallet principal.
                self.register_hardware_wallet(
                    account,
                    RegisterHardwareWalletRequest {
                        name: format!("hw_wallet_{toy_account_index}_{hardware_wallet_index}"),
                        principal,
                    },
                );
            }
            // Attaches canisters to the account:
            for canister_index in 0..(toy_account_index % (MAX_CANISTERS_PER_ACCOUNT + 1)) {
                let canister_id = CanisterId::from(toy_account_index * MAX_CANISTERS_PER_ACCOUNT + canister_index); //PrincipalId::new_user_test_id(toy_account_index + canister_index + 1);
                let attach_canister_request = AttachCanisterRequest {
                    name: format!("canister_{toy_account_index}_{canister_index}"),
                    canister_id,
                    block_index: Some(123),
                };
                self.attach_canister(account, attach_canister_request);
            }
        }
        index_range_start
    }

    /// Creates an account store with the given number of test accounts.
    #[cfg(test)]
    pub fn with_toy_accounts(num_accounts: u64) -> AccountsStore {
        let mut accounts_store = AccountsStore::default();
        accounts_store.create_toy_accounts(num_accounts);
        accounts_store
    }
}

#[test]
fn should_be_able_to_create_large_accounts_store() {
    let num_accounts = 10_000;
    let accounts_store = AccountsStore::with_toy_accounts(num_accounts);
    assert_eq!(num_accounts, accounts_store.accounts_db.db_accounts_len());
}
