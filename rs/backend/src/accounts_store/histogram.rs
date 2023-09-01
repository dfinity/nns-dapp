//! A histogram of the accounts store.
use super::{Account, CandidType, Deserialize};
use std::collections::BTreeMap;
use std::ops::Add;

#[derive(CandidType, Deserialize, Debug, Default, Eq, PartialEq, Clone)]
pub struct AccountsStoreHistogram {
    /// The number of accounts in the store.
    pub accounts_count: u64,
    /// A histogram of the number of transactions per account.
    /// Note: The buckets are logarithmic, so the buckets are:
    ///
    /// - bucket 0: 0 transactions
    /// - bucket 1: 1 transaction
    /// - bucket 3: 2-3 transactions
    /// - bucket 7: 4-7 transactions
    /// - etc
    ///
    /// This is because otherwise accounts with a large number of transactions would be insufficiently anonymised.
    /// There are block explorers so technically this data is already public but we don't need that level of
    /// precision and would rather not leak information.
    pub default_account_transactions: BTreeMap<u32, u64>,
    /// A histogram of the number of sub accounts per account.
    ///
    /// Note: The maximum number of subaccounts is quite small so a direct count is fine.
    pub sub_accounts: BTreeMap<u32, u64>,
    /// A histogram of the number of transactions per sub account.
    ///
    /// Note: The buckets are logarithmic, as with `default_account_transactions`.
    pub sub_account_transactions: BTreeMap<u32, u64>,
    /// A histogram of the number of hardware wallets per account.
    hardware_wallet_accounts: BTreeMap<u32, u64>,
    /// A histogram of the number of canisters per account.
    canisters: BTreeMap<u32, u64>,
}
impl Add<&Account> for AccountsStoreHistogram {
    type Output = AccountsStoreHistogram;

    fn add(mut self, rhs: &Account) -> AccountsStoreHistogram {
        self.accounts_count += 1;
        self.default_account_transactions
            .entry(log2_bucket(rhs.default_account_transactions.len()))
            .and_modify(|e| *e += 1)
            .or_insert(1);
        self.sub_accounts
            .entry(log2_bucket(rhs.sub_accounts.len()))
            .and_modify(|e| *e += 1)
            .or_insert(1);
        rhs.sub_accounts.values().for_each(|sub_account| {
            self.sub_account_transactions
                .entry(log2_bucket(sub_account.transactions.len()))
                .and_modify(|e| *e += 1)
                .or_insert(1);
        });
        self
    }
}

/// Determines which log base 2 bucket a count falls into.
fn log2_bucket(mut count: usize) -> u32 {
    let mut bucket_bound = 1;
    while count != 0 {
        count <<= 1;
        bucket_bound >>= 1;
    }
    bucket_bound - 1
}
