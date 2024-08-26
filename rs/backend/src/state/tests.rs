use crate::{
    accounts_store::schema::{proxy::AccountsDb, AccountsDbTrait, SchemaLabel},
    state::{
        partitions::{Partitions, PartitionsMaybe},
        AccountsDbAsMap, AssetHashes, Assets, PerformanceCounts, StableState, State,
    },
};
use ic_stable_structures::{DefaultMemoryImpl, VectorMemory};
use pretty_assertions::assert_eq;
use proptest::proptest;
use std::cell::RefCell;

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
    // Drop the accounts DB from the accounts store before comparing. We use
    // stable structures to store the accounts DB, which are stored separately
    // so we don't encode/decode them as part of the accounts store.
    let _dropped_accounts_db = toy_state
        .accounts_store
        .borrow_mut()
        .replace_accounts_db(AccountsDb::Map(AccountsDbAsMap::default()));
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
fn state_can_be_created_accounts_in_stable_memory() {
    // State is backed by stable memory:
    let memory = DefaultMemoryImpl::default();
    let state = State::new(memory);
    assert_eq!(
        state.accounts_store.borrow().schema_label(),
        SchemaLabel::AccountsInStableMemory,
        "Newly created state does not have the expected schema"
    );

    // Basic functionality check - we can insert an account?
    state
        .accounts_store
        .borrow_mut()
        .db_insert_account(&[0u8; 32], crate::accounts_store::schema::tests::toy_account(1, 2));

    // Do the partitions look as expected?
    let partitions_maybe_label = format!("{}", state.partitions_maybe.borrow());
    assert_eq!(partitions_maybe_label.as_str(), "Partitions");

    // Are accounts stored in the expected partition?
    assert_eq!(
        state.accounts_store.borrow().schema_label(),
        SchemaLabel::AccountsInStableMemory,
        "Accounts are not stored in the expected schema"
    );
}

fn state_can_be_saved_and_recovered_from_stable_memory(num_accounts: u64) {
    // State is backed by stable memory:
    let memory = DefaultMemoryImpl::default();
    // We will get a second reference to the same memory so that we can compare the initial state to the state post-upgrade.
    let memory_after_upgrade = Partitions::copy_memory_reference(&memory); // The same memory.

    // On init, the state is created using a schema specified in the init arguments:
    let state = State::new(memory);
    // Typically the state is populated with data:
    // Inserting an account creates:
    // - An account entry, that is stored on the heap or in stable structures depending on the schema.
    // - Database stats that record the number of accounts; these are currently stored on the heap for all schemas.
    for toy_account_index in 0..num_accounts {
        state.accounts_store.borrow_mut().db_insert_account(
            &toy_account_index.to_be_bytes()[..],
            crate::accounts_store::schema::tests::toy_account(toy_account_index, 2),
        );
    }
    // The state is backed by stable memory.  Pre-upgrade, any state that is not already in stable memory must be saved.
    state.save();
    // Post-upgrade state can then be restored from memory.
    let new_state = State::from(memory_after_upgrade);
    // The state should be restored to the same state as before:
    assert_eq!(state, new_state);
}

proptest! {
    #[test]
    // Note: By popular demand this is run with various sizes, although size _should_ have no
    // effect on the test.
    fn state_of_any_size_can_be_saved_and_recovered_from_stable_memory(num_accounts: u8) {
        state_can_be_saved_and_recovered_from_stable_memory(u64::from(num_accounts))
    }
}
