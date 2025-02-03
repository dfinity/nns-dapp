/// Tests that the stats data collection is as expected
use super::get_stats;
use crate::state::{tests::populate_test_state, State};

/// Verifies that the stats match the state.
#[test]
fn populated_state_should_have_populated_stats() {
    let mut state = State::new();
    populate_test_state(2, &mut state);

    let stats = get_stats(&state);

    // Each account has a sub-account and a hardware wallet account.
    assert_eq!(stats.accounts_count, 2);
    assert_eq!(stats.sub_accounts_count, 2);
    assert_eq!(stats.hardware_wallet_accounts_count, 2);

    assert!(
        !stats.performance_counts.is_empty(),
        "Stats should include performance counts"
    );
}
