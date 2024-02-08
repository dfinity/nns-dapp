//! Account store constructors.
use super::*;

impl From<AccountsDb> for AccountsStore {
    fn from(db: AccountsDb) -> Self {
        AccountsStore {
            accounts_db: AccountsDbAsProxy::from(db),
            ..Default::default()
        }
    }
}

<<<<<<< HEAD
=======
#[cfg(test)]
>>>>>>> origin/main
impl AccountsStore {
    /// Adds an `accounts_db` to the store.
    ///
    /// Used when the `accounts_db` (per-user account data) and the rest of the accounts store
    /// are stored in different virtual memories.
    ///
    /// When recreating state post upgrade, the accounts store sans `accounts_db` is recovered from
    /// one virtual memory, then the `accounts_db` is added from another virtual memory.
    #[must_use]
    pub fn replace_accounts_db(&mut self, accounts_db: AccountsDb) -> AccountsDb {
        let original_accounts_db = self.accounts_db;
        self.accounts_db = AccountsDbAsProxy::from(accounts_db);
        original_accounts_db
    }
}
