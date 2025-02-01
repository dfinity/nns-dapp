use crate::{
    accounts_store::{schema::AccountsDbTrait, RegisterHardwareWalletRequest},
    assets::{insert_asset_into_state, Asset},
    state::{reset_partitions, PerformanceCounts, State},
    stats::Stats,
    tvl::state::TvlState,
};
use ic_base_types::PrincipalId;
use pretty_assertions::assert_eq;
use proptest::proptest;
use std::collections::BTreeMap;

pub(crate) fn populate_test_state(num_accounts: u64, state: &mut State) {
    for account_index in 0..num_accounts {
        let principal_id = PrincipalId::new_user_test_id(account_index);
        state.accounts_store.add_account(principal_id);
        state
            .accounts_store
            .create_sub_account(principal_id, "sub_account".to_string());
        state
            .accounts_store
            .register_hardware_wallet(principal_id, RegisterHardwareWalletRequest::test_data());
    }
    insert_asset_into_state(state, "asset", Asset::new_stable(vec![0u8; 100]));
    state.performance = PerformanceCounts::test_data();
    state.tvl_state = TvlState::test_data();
}

fn state_can_be_saved_and_recovered_from_stable_memory(num_accounts: u64) {
    // A brand new state with no data (should be called in `init`).
    let mut state = State::new();

    // Populate the state with some data.
    populate_test_state(num_accounts, &mut state);

    // Destructure to make sure all fields are covered.
    let State {
        accounts_store,
        assets,
        asset_hashes,
        tvl_state,
        performance: _, // This field is not persisted through upgrades.
    } = &state;
    let expected_accounts: BTreeMap<_, _> = accounts_store.range(..).collect();
    let mut expected_account_stats = Stats::default();
    accounts_store.get_stats(&mut expected_account_stats);
    let expected_assets = assets.clone();
    let expected_tvl_state = tvl_state.clone();
    let expected_asset_hashes = asset_hashes.clone();

    // Save the state (should be called in `pre_upgrade`).
    state.save();

    // Restore the state (should be called in `post_upgrade`).
    let restored_state = State::new_restored();

    // Now we examine the restored state against the original state:

    // The accounts in the AccountsStore are either in stable structures.
    assert_eq!(
        restored_state.accounts_store.range(..).collect::<BTreeMap<_, _>>(),
        expected_accounts
    );
    // The account stats, assets, and tvl state are serialized/deserialized during upgrades.
    // The assets and tvl state are serialized/deserialized during upgrades.
    let mut actual_account_stats = Stats::default();
    restored_state.accounts_store.get_stats(&mut actual_account_stats);
    assert_eq!(actual_account_stats, expected_account_stats);
    assert_eq!(restored_state.assets, expected_assets);
    assert_eq!(restored_state.tvl_state, expected_tvl_state);
    // The asset hashes are recomputed from assets during upgrades.
    assert_eq!(restored_state.asset_hashes, expected_asset_hashes);
    // The performance counts are not persisted through upgrades, so they are reset after upgrades.
    assert_eq!(restored_state.performance, PerformanceCounts::default());
}

proptest! {
    #[test]
    // Note: By popular demand this is run with various sizes, although size _should_ have no
    // effect on the test.
    fn state_of_any_size_can_be_saved_and_recovered_from_stable_memory(num_accounts: u8) {
        // Reset the partitions to ensure a clean slate. This is needed because the partitions are
        // in a thread-local variable. The `proptest!` macro runs different iterations of the test
        // in the same thread, and hence the partitions can have values from the previous iteration
        // if not reset explicitly.
        reset_partitions();
        state_can_be_saved_and_recovered_from_stable_memory(u64::from(num_accounts))
    }
}
