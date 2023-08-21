//! Data storage schemas.
pub mod s0;

use super::AccountsStore;
use crate::accounts_store::Account;
use s0::AccountsDbS0Trait;

/// API methods that must be implemented by any account store.
pub trait AccountsDbTrait {
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account>;
    fn db_insert_account(&mut self, account_key: &[u8], account: Account);
    fn db_contains_account(&self, account_key: &[u8]) -> bool;
    fn db_remove_account(&mut self, account_key: &[u8]);
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
}
