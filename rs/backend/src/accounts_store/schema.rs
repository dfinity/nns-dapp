//! Data storage schemas.
use crate::accounts_store::Account;

pub mod map;
pub mod proxy;
pub mod s1;
#[cfg(test)]
mod tests;

/// API methods that must be implemented by any account store.
///
/// # Example
///
/// ```
/// use nns_dapp::accounts_store::schema::map::AccountsDbAsMap;
/// use nns_dapp::accounts_store::Account;
/// use icp_ledger::{AccountIdentifier};
/// use ic_base_types::{CanisterId, PrincipalId};
/// use crate::nns_dapp::accounts_store::schema::AccountsDbTrait;
///
/// let mut mock = AccountsDbAsMap::default();
/// let caller = PrincipalId::new_user_test_id(1); // Typically a user making an API call.
/// let account_identifier = AccountIdentifier::from(caller);
/// let new_account = Account::new(caller, account_identifier);
/// mock.db_insert_account(&account_identifier.to_vec(), new_account.clone());
/// assert!(mock.db_contains_account(&account_identifier.to_vec()));
/// assert_eq!(mock.db_accounts_len(), 1);
/// assert_eq!(mock.db_get_account(&account_identifier.to_vec()), Some(new_account.clone()));
/// mock.db_remove_account(&account_identifier.to_vec());
/// assert!(!mock.db_contains_account(&account_identifier.to_vec()));
/// assert_eq!(mock.db_accounts_len(), 0);
/// ```
///
/// Note: The key is `&[u8]` for historical reasons.  It _may_ be possible
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

    /// Tries to modify an account, if it exists, with the given function.  The modified account is
    /// saved only if the function returns a successful result.
    ///
    /// Warning: This does NOT guarantee any locking mechanism.  IC canisters can execute only one
    /// update function at a time, so there is no issue of several functions executing at the same
    /// time.  As such, protection against concurrent access is not a priority.
    ///
    /// # Arguments
    /// - `account_key`: the account lookup key, typically `account_identifier.to_vec()`.
    /// - `f`: a function that takes a mutable reference to the account as an argument and returns
    ///   a result.
    ///
    /// # Returns
    /// - `None`, if the account does not exist.
    /// - `Some(result)`, where `result` is the value returned by `f`, if the account exists.
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

    /// Iterates over accounts in the data store.
    fn values(&self) -> Box<dyn Iterator<Item = Account> + '_>;

    /// Gets the label of the storage schema.
    fn schema_label(&self) -> SchemaLabel;
}

/// A label to identify the schema.
///
/// Note: The numeric representations of these labels are guaranteed to be stable.
#[repr(u32)]
pub enum SchemaLabel {
    /// Data is stored on the heap in a BTreeMap and serialized to stable memory on upgrade.
    /// Implemented by: [`map::AccountsDbAsMap`]
    Map = 0,
}

/// A trait for data stores that support `BTreeMap` for account storage.
pub trait AccountsDbBTreeMapTrait {
    /// Creates a database from a map of accounts.
    fn from_map(map: std::collections::BTreeMap<Vec<u8>, Account>) -> Self;
    /// Provides the accounts as a map.
    fn as_map(&self) -> &std::collections::BTreeMap<Vec<u8>, Account>;
}
