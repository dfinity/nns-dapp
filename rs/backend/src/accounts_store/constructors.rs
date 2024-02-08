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

impl AccountsStore {
    /// Adds an `accounts_db` to the store.
    ///
    /// Used when the accountsdb (per-user account data) and the rest of the accounts store
    /// are stored in different virtual memories.
    ///
    /// When recreating state post upgrade, the accounts store sans accountsdb is recovered from
    /// one virtual memory, then the accountsdb is added from another virtual memory.
    pub fn with_accounts_db(&mut self, accounts_db: AccountsDb) {
        self.accounts_db = AccountsDbAsProxy::from(accounts_db);
    }
}
