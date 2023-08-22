//! Data storage schemas.
pub mod s0;

use super::AccountsStore;
use crate::accounts_store::Account;
use s0::AccountsDbS0Trait;

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
    /// Inserts an  account in the data store.
    fn db_insert_account(&mut self, account_key: &[u8], account: Account);
    /// Checks if an account is in the data store.
    fn db_contains_account(&self, account_key: &[u8]) -> bool;
    /// Gets an account from the data store.
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account>;
    /// Removes an account from the data store.
    fn db_remove_account(&mut self, account_key: &[u8]);
    /// Returns the number of accounts in the data store.
    ///
    /// Note: This is purely for statistical purposes and is the only statistic
    ///       currently measured for accounts.
    fn db_accounts_len(&self) -> u64;
    /// Utility for the common case of getting an entry, modifying it, and putting it back.
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    #[derive(Default)]
    struct MockAccountsDb {
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
}

// Implement schema S0 for the AccountsStore.
impl s0::AccountsDbS0Trait for AccountsStore {
    fn s0_get_account_page(&self, account_storage_key: &s0::AccountStorageKey) -> Option<s0::AccountStoragePage> {
        crate::state::ACCOUNTS_MEMORY_A.with(|accounts_memory_a| accounts_memory_a.borrow().get(account_storage_key))
    }

    fn s0_insert_account_page(
        &mut self,
        account_storage_key: s0::AccountStorageKey,
        account: s0::AccountStoragePage,
    ) -> Option<s0::AccountStoragePage> {
        crate::state::ACCOUNTS_MEMORY_A
            .with(|accounts_memory_a| accounts_memory_a.borrow_mut().insert(account_storage_key, account))
    }

    fn s0_contains_account_page(&self, account_storage_key: &s0::AccountStorageKey) -> bool {
        crate::state::ACCOUNTS_MEMORY_A
            .with(|accounts_memory_a| accounts_memory_a.borrow().contains_key(account_storage_key))
    }

    fn s0_remove_account_page(
        &mut self,
        account_storage_key: &s0::AccountStorageKey,
    ) -> Option<s0::AccountStoragePage> {
        crate::state::ACCOUNTS_MEMORY_A
            .with(|accounts_memory_a| accounts_memory_a.borrow_mut().remove(account_storage_key))
    }

    fn s0_accounts_len(&self) -> u64 {
        crate::state::ACCOUNTS_MEMORY_A.with(|accounts_memory_a| {
            // TODO: Require the data store to provide an iterator.
            // TODO: Benchmark how long this takes.  It is a scan over the entire data store; which is bad, on the other hand we do this only for analysis and if affordable, we can pull out rich data.
            accounts_memory_a
                .borrow()
                .iter()
                .filter(|(key, _)| key.page_num() == 0)
                .count() as u64
        })
    }
}

// Implement the AccountsDbTrait for the AccountsStore.
impl AccountsDbTrait for AccountsStore {
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.s0_get_account(account_key)
    }
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.s0_insert_account(account_key, account);
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.s0_contains_account(account_key)
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.s0_remove_account(account_key);
    }
    fn db_accounts_len(&self) -> u64 {
        self.s0_accounts_len()
    }
}
