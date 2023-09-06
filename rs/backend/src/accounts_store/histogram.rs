//! A histogram of the accounts store.
use super::{Account, CandidType, Deserialize};
use std::collections::BTreeMap;
use std::ops::Add;

#[cfg(test)]
mod tests;

#[derive(CandidType, Deserialize, Debug, Default, Eq, PartialEq, Clone)]
pub struct AccountsStoreHistogram {
    /// The number of accounts in the store.
    pub accounts_count: u64,
    /// A histogram of the number of transactions per account.
    /// Note: The buckets are logarithmic, so the buckets are:
    ///
    /// - bucket key 0: 0 transactions
    /// - bucket key 1: 1 transaction
    /// - bucket key 3: 2-3 transactions
    /// - bucket key 7: 4-7 transactions
    /// - etc
    ///
    /// This is because otherwise accounts with a large number of transactions would be insufficiently anonymised.
    /// There are block explorers so technically this data is already public but we don't need that level of
    /// precision and would rather not leak information.
    default_account_transactions: BTreeMap<u32, u64>,
    /// A histogram of the number of sub-accounts per account.
    ///
    /// Note: The buckets are logarithmic, as with `default_account_transactions`.
    sub_accounts: BTreeMap<u32, u64>,
    /// A histogram of the number of transactions per sub account.
    ///
    /// Note: The buckets are logarithmic, as with `default_account_transactions`.
    sub_account_transactions: BTreeMap<u32, u64>,
    /// A histogram of the number of hardware wallets per account.
    ///
    /// Note: The buckets are logarithmic, as with `default_account_transactions`.
    hardware_wallet_accounts: BTreeMap<u32, u64>,
    /// A histogram of the number of canisters per account.
    ///
    /// Note: The buckets are logarithmic, as with `default_account_transactions`.
    canisters: BTreeMap<u32, u64>,
}

// Getters and setters for the histogram fields that ensure that data is placed in the right columns.
impl AccountsStoreHistogram {
    /// The bucket for a given number of default account transactions.
    ///
    /// Note: The bucket is logarithmic base 2.
    pub fn default_account_transactions(&mut self, count: usize) -> &mut u64 {
        self.default_account_transactions.entry(log2_bucket(count)).or_insert(0)
    }
    /// The bucket for a given number of sub-accounts.
    pub fn sub_accounts(&mut self, count: usize) -> &mut u64 {
        self.sub_accounts.entry(log2_bucket(count)).or_insert(0)
    }
    /// The bucket for a given number of sub-account transactions.
    ///
    /// Note: The bucket is logarithmic base 2.
    pub fn sub_account_transactions(&mut self, count: usize) -> &mut u64 {
        self.sub_account_transactions.entry(log2_bucket(count)).or_insert(0)
    }
    /// The bucket for a given number of hardware wallets.
    pub fn hardware_wallet_accounts(&mut self, count: usize) -> &mut u64 {
        self.hardware_wallet_accounts.entry(log2_bucket(count)).or_insert(0)
    }
    /// The bucket for a given number of canisters.
    ///
    /// Note: The bucket is logarithmic base 2.
    pub fn canisters(&mut self, count: usize) -> &mut u64 {
        self.canisters.entry(log2_bucket(count)).or_insert(0)
    }
    /// Remove empty buckets from the histogram.
    pub fn remove_empty_buckets(&mut self) {
        self.default_account_transactions.retain(|_, count| *count != 0);
        self.sub_accounts.retain(|_, count| *count != 0);
        self.sub_account_transactions.retain(|_, count| *count != 0);
        self.hardware_wallet_accounts.retain(|_, count| *count != 0);
        self.canisters.retain(|_, count| *count != 0);
    }
}

impl Add<&Account> for AccountsStoreHistogram {
    type Output = AccountsStoreHistogram;

    fn add(mut self, rhs: &Account) -> AccountsStoreHistogram {
        self.accounts_count += 1;
        *self.default_account_transactions(rhs.default_account_transactions.len()) += 1;
        *self.sub_accounts(rhs.sub_accounts.len()) += 1;
        rhs.sub_accounts.values().for_each(|sub_account| {
            *self.sub_account_transactions(sub_account.transactions.len()) += 1;
        });
        *self.hardware_wallet_accounts(rhs.hardware_wallet_accounts.len()) += 1;
        *self.canisters(rhs.canisters.len()) += 1;
        self
    }
}

/// Determines which log base 2 bucket a count falls into.
fn log2_bucket(count: usize) -> u32 {
    ((1u64 << usize::ilog2(count * 2 + 1)) - 1) as u32
}
