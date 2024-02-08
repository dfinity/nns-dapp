//! Account store constructors.
use super::*;
use std::mem;

impl From<AccountsDb> for AccountsStore {
    fn from(db: AccountsDb) -> Self {
        AccountsStore {
            accounts_db: AccountsDbAsProxy::from(db),
            ..Default::default()
        }
    }
}

impl AccountsStore {
    /// Adds an `accounts_db` to the store.
    ///
    /// Used when the `accounts_db` (per-user account data) and the rest of the accounts store
    /// are stored in different virtual memories.
    ///
    /// When recreating state post upgrade, the accounts store sans `accounts_db` is recovered from
    /// one virtual memory, then the `accounts_db` is added from another virtual memory.
    ///
    /// # Returns
    /// - The original accounts database.  This is always an `AccountsDbAsProxy`.
    #[must_use]
    pub fn replace_accounts_db(&mut self, accounts_db: AccountsDb) -> AccountsDbAsProxy {
        mem::replace(&mut self.accounts_db, AccountsDbAsProxy::from(accounts_db))
    }
}
