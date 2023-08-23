//! Data storage schemas.
use crate::accounts_store::Account;

/// API methods that must be implemented by any account store.
///
/// # Example
///
/// ```
/// let mut mock = MockAccountsDb::default();
/// let caller = PrincipalId::new_user_test_id(1); // Typically a user making an API call.
/// let account_identifier = AccountIdentifier::from(caller).to_vec();
/// let new_account = Account::new(caller, account_identifier);
/// mock.db_insert_account.insert(account_identifier.to_vec(), new_account);
/// assert!(mock.db_contains_account(&account_identifier.to_vec()));
/// assert_eq!(mock.db_accounts_len(), 1);
/// assert_eq!(mock.db_get_account(&account_identifier.to_vec()), Some(new_account));
/// mock.db_remove_account(&account_identifier.to_vec());
/// assert!(!mock.db_contains_account(&account_identifier.to_vec()));
/// assert_eq!(mock.db_accounts_len(), 0);
/// ```
///
/// Note: The key is &[u8] for historical reasons.  It _may_ be possible
/// to change this to `AccountIdentifier`.
pub trait AccountsDbTrait {
    // Basic CRUD

    /// Inserts an account into the data store.
    fn db_insert_account(&mut self, account_key: &[u8], account: Account);
    /// Checks if an account is in the data store.
    fn db_contains_account(&self, account_key: &[u8]) -> bool;
    /// Gets an account from the data store.
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account>;
    /// Removes an account from the data store.
    fn db_remove_account(&mut self, account_key: &[u8]);

    // Statistics

    /// Returns the number of accounts in the data store.
    ///
    /// Note: This is purely for statistical purposes and is the only statistic
    ///       currently measured for accounts.  More statistics _may_ be added in future.
    fn db_accounts_len(&self) -> u64;

    // Utilities

    /// Modifies an account, if it exists, with the given function.
    fn db_with_account<F, T>(&mut self, account_key: &[u8], f: F) -> Option<T>
    where
        // The closure takes an account as an argument.  It may return any type.
        F: Fn(&mut Account) -> T,
    {
        if let Some(mut account) = self.db_get_account(account_key) {
            let ans = f(&mut account);
            self.db_insert_account(account_key, account);
            Some(ans)
        } else {
            None
        }
    }
    /// Tries to modify an account, if it exists, with the given function.  The modified account is
    /// saved only if the function returns a successful result.
    fn db_try_with_account<F, RS, RF>(&mut self, account_key: &[u8], f: F) -> Option<Result<RS, RF>>
    where
        // The closure takes an account as an argument.  It may return any type.
        F: Fn(&mut Account) -> Result<RS, RF>,
    {
        if let Some(mut account) = self.db_get_account(account_key) {
            let ans = f(&mut account);
            if ans.is_ok() {
                self.db_insert_account(account_key, account);
            }
            Some(ans)
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::{AccountIdentifier, CanisterId, NamedCanister, PrincipalId};
    use super::*;
    use std::collections::{BTreeMap, HashMap};

    /// Toy accounts database for testing.
    #[derive(Default)]
    pub struct MockAccountsDb {
        accounts: BTreeMap<Vec<u8>, Account>,
    }

    impl AccountsDbTrait for MockAccountsDb {
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
    }

    /// Creates a toy canister.
    fn toy_canister(account_index: u64, canister_index: u64) -> NamedCanister {
        let canister_id = CanisterId::from(canister_index);
        NamedCanister {
            name: format!("canister_{account_index}_{canister_index}"),
            canister_id,
        }
    }

    /// Creates a toy account.  The contents do not need to be meaningful; do need to have size.
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
            account.canisters.push(toy_canister(account_index, canister_index));
        }
        // FIN
        account
    }

    /// Verifies that an arbitrary AccountsDbTrait implementation does basic crud correctly.
    ///
    /// Individual implementations are expected to perform their own tests for error conditions
    /// relevant to them.
    fn assert_basic_crud_works<D>(mut storage: D)
    where
        D: AccountsDbTrait,
    {
        let account_key = vec![1, 2, 3];
        let account = toy_account(1, 5);
        // Create:
        storage.db_insert_account(&account_key, account.clone());
        // Read:
        assert!(storage.db_contains_account(&account_key));
        assert_eq!(storage.db_get_account(&account_key), Some(account.clone()));
        // Update:
        let updated_account = toy_account(1, 1000);
        storage.db_insert_account(&account_key, updated_account.clone());
        assert!(storage.db_contains_account(&account_key));
        assert_eq!(storage.db_get_account(&account_key), Some(updated_account.clone()));
        // Delete:
        storage.db_remove_account(&account_key);
        assert!(!storage.db_contains_account(&account_key));
        assert_eq!(storage.db_get_account(&account_key), None);
    }

    /*
    /// Verifies that the update function `db_with_account()` works correctly.
    fn assert_update_with_works(storage: AccountsDbTrait) {
        let account_key = vec![1, 2, 3];
        let account = toy_account(1, 5);
        // Create:
        storage.db_insert_account(&account_key, account.clone());
        assert_eq!(storage.db_get_account(&account_key), Some(account.clone()));
        // Update:
        // Modify by adding a canister
        {
            // We will add a new canister:
            let canister = toy_canister(3, 14159265359);
            let expected_last_canister = canister.clone();
            // Verify that it is not already the last...
            assert_ne!(
                storage
                    .db_get_account(&account.key())
                    .expect("Failed to get account")
                    .expect("Account should have had canisters"),
                expected_last_canister
            );
            // The function return value; it should be passed through.
            let return_value = 42;
            // Update the account:
            let actual_return_value = storage.db_with_account(&account_key, move |mut account| {
                account.canisters.push(canister);
                // The return value should be passed through.
                return_value
            });
            assert_eq!(return_value, actual_return_value);
            // Verify that the new canister is now the last.
            assert_eq!(
                storage
                    .db_get_account(&account.key())
                    .expect("Failed to get account")
                    .expect("Account should have had canisters"),
                expected_last_canister
            );
        }
        storage.db_remove_account(&account_key);
        assert!(!storage.db_contains_account(&account_key));
        assert_eq!(storage.db_get_account(&account_key), None);
    }
    */

    #[test]
    fn mock_accounts_db_should_crud() {
        let db = MockAccountsDb::default();
        assert_basic_crud_works(db);
    }
}
