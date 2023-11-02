use super::{AssetHashes, Assets, Memory, PerformanceCounts, StableState, State};
use crate::accounts_store::schema::{SchemaLabel, SchemaLabelBytes};
use ic_stable_structures::VectorMemory;
use std::{cell::RefCell, rc::Rc};
use strum::IntoEnumIterator;

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
    // This is the highly valuable state:
    assert_eq!(
        toy_state.accounts_store, parsed.accounts_store,
        "Accounts store has changed"
    );
    // It's nice if we keep these:
    assert_eq!(toy_state.assets, parsed.assets, "Assets have changed");
    assert_eq!(toy_state.asset_hashes, parsed.asset_hashes, "Asset hashes have changed");
}

#[test]
fn schema_can_be_read_from_memory() {
    let raw_memory = vec![];
    let memory: VectorMemory = Rc::new(RefCell::new(raw_memory));
    memory.grow(1);
    // Pre-populate the memory so that it contains more than just the schema.
    memory.write(0, &[0xa5u8; 1000]);
    // Without a checksummed schema, we should get schema None.
    assert_eq!(None, State::schema_version_from_memory(memory.clone()));
    for schema in SchemaLabel::iter() {
        let schema_bytes = SchemaLabelBytes::from(schema);
        memory.write(0, &schema_bytes);
        assert_eq!(Some(schema), State::schema_version_from_memory(memory.clone()));
    }
}
