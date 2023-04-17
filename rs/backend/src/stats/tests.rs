/// Tests that the stats data collection is as expected
use super::get_stats;
use crate::state::tests::setup_test_state;

/// Verifies that the stats match the state.
#[test]
fn populated_state_should_have_populated_stats() {
    let state = setup_test_state();
    let stats = get_stats(&state);
    crate::accounts_store::tests::assert_initial_test_store_stats_are_correct(&stats);
    assert!(
        !stats.performance_counts.is_empty(),
        "Stats should include performance counts"
    );
}
