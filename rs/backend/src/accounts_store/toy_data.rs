//! Test data for unit tests and test networks.

use crate::accounts_store::{
    Account, AccountIdentifier, AccountsStore, AttachCanisterRequest, CanisterId, PrincipalId,
    RegisterHardwareWalletRequest, TransactionType,
};

const MAX_SUB_ACCOUNTS_PER_ACCOUNT: u64 = 3; // Toy accounts have between 0 and this many subaccounts.
const MAX_HARDWARE_WALLETS_PER_ACCOUNT: u64 = 1; // Toy accounts have between 0 and this many hardware wallets.
const MAX_PENDING_TRANSACTIONS_PER_ACCOUNT: u64 = 3; // Toy accounts have between 0 and this many pending transactions.
const MAX_CANISTERS_PER_ACCOUNT: u64 = 2; // Toy accounts have between 0 and this many canisters.

/// Principal of a toy account with a given index.
fn toy_account_principal_id(toy_account_index: u64) -> PrincipalId {
    PrincipalId::new_user_test_id(toy_account_index)
}

impl AccountsStore {
    /// Creates the given number of toy accounts, with linked sub-accounts, hardware wallets, pending transactions, and canisters.
    ///
    /// # Returns
    /// - The index of the first account created by this call.  The account indices are first...first+num_accounts-1.
    pub fn create_toy_accounts(&mut self, num_accounts: u64) -> u64 {
        // If we call this function twice, we don't want to create the same accounts again, so we index from the number of existing accounts.
        let num_existing_accounts = self.accounts.len() as u64;
        let (index_range_start, index_range_end) = (num_existing_accounts, (num_existing_accounts + num_accounts));
        // Creates accounts:
        for toy_account_index in index_range_start..index_range_end {
            let account = toy_account_principal_id(toy_account_index);
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
                };
                self.attach_canister(account, attach_canister_request);
            }
        }
        index_range_start
    }

    /// Gets the toy account with the given index.
    pub fn get_toy_account(&self, toy_account_index: u64) -> Result<Account, String> {
        let principal = PrincipalId::new_user_test_id(toy_account_index);
        let account_identifier = AccountIdentifier::from(principal);
        let account = self
            .accounts
            .get(&account_identifier.to_vec())
            .ok_or_else(|| format!("Account not found: {}", toy_account_index))?;
        Ok((*account).clone())
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
    assert_eq!(num_accounts, accounts_store.accounts.len() as u64);
}
