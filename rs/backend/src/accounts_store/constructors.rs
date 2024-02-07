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
