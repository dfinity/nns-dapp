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
    /// Adds an accounts_db to the store.
    pub fn with_accounts_db(&mut self, accounts_db: AccountsDb) {
        self.accounts_db = AccountsDbAsProxy::from(accounts_db);
    }
}
