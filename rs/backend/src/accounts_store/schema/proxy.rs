//! Accounts DB that delegates API calls to underlying implementations.
//! 
//! The proxy manages migrations from one implementation to another.
use super::{map::AccountsDbAsMap, Account, AccountsDbTrait};

#[derive(Default)]
pub struct AccountsDbAsProxy {
    as_map: AccountsDbAsMap,
}

impl AccountsDbTrait for AccountsDbAsProxy {
    fn db_insert_account(&mut self, account_key: &[u8], account: Account) {
        self.as_map.db_insert_account(account_key, account);
    }
    fn db_contains_account(&self, account_key: &[u8]) -> bool {
        self.as_map.db_contains_account(account_key)
    }
    fn db_get_account(&self, account_key: &[u8]) -> Option<Account> {
        self.as_map.db_get_account(account_key)
    }
    fn db_remove_account(&mut self, account_key: &[u8]) {
        self.as_map.db_remove_account(account_key);
    }
    fn db_accounts_len(&self) -> u64 {
        self.as_map.db_accounts_len() as u64
    }
}

#[cfg(test)]
mod tests {
    use super::super::tests as generic_tests;
    use super::AccountsDbAsProxy;

    #[test]
    fn proxy_accounts_db_should_crud() {
        generic_tests::assert_basic_crud_works(AccountsDbAsProxy::default());
    }

    #[test]
    fn proxy_accounts_update_with_happy_path_should_update_account() {
        generic_tests::assert_update_with_happy_path_works(AccountsDbAsProxy::default());
    }

    #[test]
    fn proxy_accounts_update_with_error_path_should_not_change_account() {
        generic_tests::assert_update_not_saved_on_error(AccountsDbAsProxy::default());
    }

    #[test]
    fn proxy_update_with_missing_key_should_return_none() {
        generic_tests::assert_update_with_missing_key_returns_none(AccountsDbAsProxy::default());
    }

    #[test]
    fn proxy_account_counts_should_be_correct() {
        generic_tests::assert_account_count_is_correct(AccountsDbAsProxy::default());
    }
}
