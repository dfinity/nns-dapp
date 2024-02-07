use super::{partitions::PartitionsMaybe, AssetHashes, Assets, Memory, PerformanceCounts, StableState, State};
use crate::accounts_store::schema::{AccountsDbTrait, SchemaLabel, SchemaLabelBytes};
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
        partitions_maybe: RefCell::new(PartitionsMaybe::None(VectorMemory::default())),
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

#[test]
fn schema_can_be_read_from_memory() {
    let memory: VectorMemory = VectorMemory::default();
    memory.grow(1);
    // Pre-populate the memory so that it contains more than just the schema.
    memory.write(0, &[0xa5u8; 1000]);
    // Without a checksummed schema, we should get schema None.
    assert_eq!(None, State::schema_version_from_memory(&memory));
    // With a checksummed schema, we should get the schema.
    for schema in SchemaLabel::iter() {
        let schema_bytes = SchemaLabelBytes::from(schema);
        memory.write(0, &schema_bytes);
        assert_eq!(Some(schema), State::schema_version_from_memory(&memory));
    }
}

#[test]
fn state_can_be_created_with_any_schema() {
    for schema in SchemaLabel::iter() {
        // State is backed by stable memory:
        let memory = DefaultMemoryImpl::default();
        let state = State::new(schema, memory);
        assert_eq!(
            state.accounts_store.borrow().schema_label(),
            schema,
            "Newly created state does not have the expected schema"
        );

        // Basic functionality check - we can insert an account?
        state
            .accounts_store
            .borrow_mut()
            .db_insert_account(&[0u8; 32], crate::accounts_store::schema::tests::toy_account(1, 2));

        // Do the partitions look as expected?
        let partitions_maybe_label = format!("{}", state.partitions_maybe.borrow());
        match (schema, partitions_maybe_label.as_str()) {
            (SchemaLabel::Map, "None") | (SchemaLabel::AccountsInStableMemory, "Partitions") => {
                println!("Partitioning is as expected for {schema:?}!");
            }
            (schema, partitions_maybe) => {
                panic!("Unexpected partitioning for {schema:?}: {partitions_maybe:?}")
            }
        }

        // Are accounts stored in the expected partition?
        assert_eq!(
            schema,
            state.accounts_store.borrow().schema_label(),
            "Accounts are not stored in the expected schema"
        );
    }
}
