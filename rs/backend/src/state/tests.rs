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

// Test upgrading and downgrading from the previous schema.
impl State {
    fn encode_old_001(&self) -> Vec<u8> {
        Candid((self.accounts_store.borrow().encode(), self.assets.borrow().encode()))
            .into_bytes()
            .unwrap()
    }

    fn decode_old_001(bytes: Vec<u8>) -> Result<Self, String> {
        let (account_store_bytes, assets_bytes) = Candid::from_bytes(bytes).map(|c| c.0)?;

        let assets = Assets::decode(assets_bytes)?;
        let asset_hashes = AssetHashes::from(&assets);

        Ok(State {
            accounts_store: RefCell::new(AccountsStore::decode(account_store_bytes)?),
            assets: RefCell::new(assets),
            asset_hashes: RefCell::new(asset_hashes),
            // Not included in the old stable memory:
            performance: RefCell::new(PerformanceCounts::default()),
        })
    }
}
#[test]
fn upgrade_from_state_001_should_succeed() {
    let toy_state = setup_test_state();
    let bytes_without_perf: Vec<u8> = toy_state.encode_old_001();
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
    // Perf is expected to change.
}
#[test]
fn downgrade_to_state_001_should_succeed() {
    let toy_state = setup_test_state();
    let bytes: Vec<u8> = toy_state.encode();
    let parsed_with_perf = State::decode_old_001(bytes).expect("Failed to parse bytes");
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
    // Perf is expected to change.
}
