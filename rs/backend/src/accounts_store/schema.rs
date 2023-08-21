//! Data storage schemas.
pub mod s0;

use crate::accounts_store::Account;

/// API methods that must be implemented by any account store.
pub trait AccountsDbTrait {
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account>;
    fn db_insert_account(&mut self, account_key: &[u8], account: Account);
    fn db_contains_account(&self, account_key: &[u8]) -> bool;
    fn db_remove_account(&mut self, account_key: &[u8]);
}