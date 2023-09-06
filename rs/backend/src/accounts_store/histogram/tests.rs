//! Tests that the histogram works as expected.
//!
//! Note: The tests are simple but formatting makes them long.

use super::*;

/// Tells an empty histogram that an account has N transactions and verifies that the expected bucket is incremented.
#[test]
fn should_increment_correct_default_account_transaction_bucket() {
    let test_vectors = [(0, 0), (1, 1), (2, 3), (3, 3), (4, 7), (5, 7)]
        .into_iter()
        .map(|(count, bucket)| {
            (
                count,
                AccountsStoreHistogram {
                    default_account_transactions: [(bucket, 1)].into_iter().collect(),
                    ..AccountsStoreHistogram::default()
                },
            )
        });
    for (count, expected_histogram) in test_vectors {
        let mut histogram = AccountsStoreHistogram::default();
        *histogram.default_account_transactions(count) += 1;
        assert_eq!(
            histogram, expected_histogram,
            "Wrong bucket incremented for count {}",
            count
        );
    }
}

/// Tells an empty histogram that an account has N subaccounts and verifies that the expected bucket is incremented.
#[test]
fn should_increment_correct_sub_account_bucket() {
    let test_vectors = [(0, 0), (1, 1), (2, 3), (3, 3), (4, 7), (5, 7)]
        .into_iter()
        .map(|(count, bucket)| {
            (
                count,
                AccountsStoreHistogram {
                    canisters: [(bucket, 1)].into_iter().collect(),
                    ..AccountsStoreHistogram::default()
                },
            )
        });
    for (count, expected_histogram) in test_vectors {
        let mut histogram = AccountsStoreHistogram::default();
        *histogram.canisters(count) += 1;
        assert_eq!(
            histogram, expected_histogram,
            "Wrong bucket incremented for count {}",
            count
        );
    }
}

/// Tells an empty histogram that an account has a subaccount with N transactions and verifies that the expected bucket is incremented.
#[test]
fn should_increment_correct_sub_account_transactions_bucket() {
    let test_vectors = [(0, 0), (1, 1), (2, 3), (3, 3), (4, 7), (5, 7)]
        .into_iter()
        .map(|(count, bucket)| {
            (
                count,
                AccountsStoreHistogram {
                    sub_account_transactions: [(bucket, 1)].into_iter().collect(),
                    ..AccountsStoreHistogram::default()
                },
            )
        });
    for (count, expected_histogram) in test_vectors {
        let mut histogram = AccountsStoreHistogram::default();
        *histogram.sub_account_transactions(count) += 1;
        assert_eq!(
            histogram, expected_histogram,
            "Wrong bucket incremented for count {}",
            count
        );
    }
}

/// Tells an empty histogram that an account has N hardware wallets and verifies that the expected bucket is incremented.
#[test]
fn should_increment_correct_hardware_wallet_accounts_bucket() {
    let test_vectors = [(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5)]
        .into_iter()
        .map(|(count, bucket)| {
            (
                count,
                AccountsStoreHistogram {
                    hardware_wallet_accounts: [(bucket, 1)].into_iter().collect(),
                    ..AccountsStoreHistogram::default()
                },
            )
        });
    for (count, expected_histogram) in test_vectors {
        let mut histogram = AccountsStoreHistogram::default();
        *histogram.hardware_wallet_accounts(count) += 1;
        assert_eq!(
            histogram, expected_histogram,
            "Wrong bucket incremented for count {}",
            count
        );
    }
}

/// Tells an empty histogram that an account has N canisters and verifies that the expected bucket is incremented.
#[test]
fn should_increment_correct_canisters_bucket() {
    let test_vectors = [(0, 0), (1, 1), (2, 3), (3, 3), (4, 7), (5, 7)]
        .into_iter()
        .map(|(count, bucket)| {
            (
                count,
                AccountsStoreHistogram {
                    canisters: [(bucket, 1)].into_iter().collect(),
                    ..AccountsStoreHistogram::default()
                },
            )
        });
    for (count, expected_histogram) in test_vectors {
        let mut histogram = AccountsStoreHistogram::default();
        *histogram.canisters(count) += 1;
        assert_eq!(
            histogram, expected_histogram,
            "Wrong bucket incremented for count {}",
            count
        );
    }
}
