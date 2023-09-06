//! Tests that the histogram works as expected.
//!
//! Note: The tests are simple but formatting makes them long.

use super::*;

mod should_increment_correct_bucket {
    use super::*;

    /// Macro to create tests for a given field name.  The test increments the histogram for a given field name,
    /// e.g. by saying that an account has 6 sub accounts, and verifies that the correct bucket (in this case 4..7)
    /// is incremented.
    macro_rules! should_increment_correct_bucket {
        ($field_name:ident) => {
            should_increment_correct_bucket!(
                $field_name,
                concat!(
                    "Tells the histogram that there is an account with N ",
                    stringify!($field_name),
                    " and verifies that the correct bucket is incremented"
                )
            );
        };
        ($field_name:ident, $doc: expr) => {
            #[doc = $doc]
            #[test]
            fn $field_name() {
                let test_vectors = [(0, 0), (1, 1), (2, 3), (3, 3), (4, 7), (5, 7), (6, 7)] // Log2 buckets
                    .into_iter()
                    .map(|(count, bucket)| {
                        (
                            count,
                            AccountsStoreHistogram {
                                // This is the bucket we expect to contain the count
                                $field_name: [(bucket, 1)].into_iter().collect(),
                                // All other values in the histogram should be zero
                                ..AccountsStoreHistogram::default()
                            },
                        )
                    });
                for (count, expected_histogram) in test_vectors {
                    let mut histogram = AccountsStoreHistogram::default();
                    *histogram.$field_name(count) += 1;
                    assert_eq!(
                        histogram, expected_histogram,
                        "Wrong bucket incremented for count {}",
                        count
                    );
                }
            }
        };
    }

    should_increment_correct_bucket!(default_account_transactions);
    should_increment_correct_bucket!(sub_accounts);
    should_increment_correct_bucket!(sub_account_transactions);
    should_increment_correct_bucket!(hardware_wallet_accounts);
    should_increment_correct_bucket!(canisters);
}
