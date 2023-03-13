/// Tests that the stats data collection is as expected
use super::get_stats;
use crate::assets::{AssetHashes, Assets};
use crate::State;
use core::cell::RefCell;

/// Creates a populated test state for testing.
fn setup_test_state() -> State {
    State {
        accounts_store: RefCell::new(crate::accounts_store::tests::setup_test_store()),
        assets: RefCell::new(Assets::default()),
        asset_hashes: RefCell::new(AssetHashes::default()),
    }
}

/// Verifies that the stats match the state.
#[test]
fn populated_state_should_have_populated_stats() {
    let state = setup_test_state();
    let stats = get_stats(&state);
    crate::accounts_store::tests::assert_initial_test_store_stats_are_correct(&stats);
}
