use super::{AssetHashes, Assets, PerformanceCounts, StableState, State};
use dfn_candid::Candid;
use on_wire::IntoWire;
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
fn adding_perf_should_succeed() {
    let toy_state = setup_test_state();
    let bytes_without_perf: Vec<u8> = Candid((
        toy_state.accounts_store.borrow().encode(),
        toy_state.assets.borrow().encode(),
    ))
    .into_bytes()
    .unwrap();
    let parsed_with_perf = State::decode(bytes_without_perf).expect("Failed to parse bytes without perf");
    // This is the highly valuable state:
    assert_eq!(
        toy_state.accounts_store, parsed_with_perf.accounts_store,
        "Accounts store has changed"
    );
    // It's nice if we keep these:
    assert_eq!(toy_state.assets, parsed_with_perf.assets, "Assets have changed");
    assert_eq!(
        toy_state.asset_hashes, parsed_with_perf.asset_hashes,
        "Asset hashes have changed"
    );
}
