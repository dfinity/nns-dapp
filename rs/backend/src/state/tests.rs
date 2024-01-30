use crate::{
    accounts_store::schema::{AccountsDbTrait, SchemaLabel},
    state::partitions::Partitions,
};

use super::{AssetHashes, Assets, PerformanceCounts, StableState, State};

use ic_stable_structures::{DefaultMemoryImpl, VectorMemory};
use std::cell::RefCell;
use strum::IntoEnumIterator;

/// Creates a populated test state for testing.
pub fn setup_test_state() -> State {
    State {
        accounts_store: RefCell::new(crate::accounts_store::tests::setup_test_store()),
        assets: RefCell::new(Assets::default()),
        asset_hashes: RefCell::new(AssetHashes::default()),
        performance: RefCell::new(PerformanceCounts::test_data()),
        partitions_maybe: RefCell::new(Err(VectorMemory::default())),
    }
}

#[test]
fn state_heap_contents_can_be_serialized_and_deserialized() {
    let toy_state = setup_test_state();
    let bytes: Vec<u8> = toy_state.encode();
    let parsed = State::decode(bytes).expect("Failed to parse");
    // This is the highly valuable state:
    assert_eq!(
        toy_state.accounts_store, parsed.accounts_store,
        "Accounts store has changed"
    );
    // It's nice if we keep these:
    assert_eq!(toy_state.assets, parsed.assets, "Assets have changed");
    assert_eq!(toy_state.asset_hashes, parsed.asset_hashes, "Asset hashes have changed");
}

// Note: This is largely the same as the test in the RustDoc, however the RustDoc test cannot test state equality
// so it is a good demonstration but not a good test.
#[test]
fn state_can_be_saved_and_recovered_from_stable_memory() {
    for schema in SchemaLabel::iter().filter(
        |schema| *schema != SchemaLabel::Map, /* Uses old stable memory APIs that can be used only inside a canister */
    ) {
        // State is backed by stable memory:
        let memory = DefaultMemoryImpl::default();
        // We will get a second reference to the same memory so that we can compare the initial state to the state post-upgrade.
        let memory_after_upgrade = Partitions::copy_memory_reference(&memory); // The same memory.
                                                                               // On init, the state is created using a schema specified in the init arguments:
        let state = State::new(schema, memory);
        // Typically the state is populated with data:
        // TODO: populate more state, both in kind and in quantity.
        state
            .accounts_store
            .borrow_mut()
            .db_insert_account(&[0u8; 32], crate::accounts_store::schema::tests::toy_account(1, 2));
        // The state is backed by stable memory.  Pre-upgrade, any state that is not already in stable memory must be saved.
        state.save();
        // Post-upgrade state can then be restored from memory.
        let new_state = State::from(memory_after_upgrade);
        // The state should be restored to the same state as before:
        assert_eq!(state, new_state);
        // In the reinstallation received any arguments, these are typically applied next.
    }
}
