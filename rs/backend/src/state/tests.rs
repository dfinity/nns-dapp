use super::{AssetHashes, Assets, PerformanceCounts, StableState, State};
use crate::state::AccountsStore;
use dfn_candid::Candid;
use on_wire::{FromWire, IntoWire};
use std::cell::RefCell;

/// Creates a populated test state for testing.
pub fn setup_test_state() -> State {
    State {
        accounts_store: RefCell::new(crate::accounts_store::tests::setup_test_store()),
        assets: RefCell::new(Assets::default()),
        asset_hashes: RefCell::new(AssetHashes::default()),
        performance: RefCell::new(PerformanceCounts::test_data()),
    }
}

#[test]
fn state_can_be_restored_from_stable_memory() {
    let toy_state = setup_test_state();
    let bytes: Vec<u8> = toy_state.encode();
    let parsed = State::decode(bytes).expect("Failed to parse");
    assert_eq!(toy_state, parsed, "State has changed");
}
