use crate::tvl::{self, governance};

fn get_total_locked_icp_e8s() -> u64 {
    tvl::STATE.with(|s| s.tvl_state.borrow().total_locked_icp_e8s)
}

fn set_total_locked_icp_e8s(new_value: u64) {
    tvl::STATE.with(|s| s.tvl_state.borrow_mut().total_locked_icp_e8s = new_value);
}

#[tokio::test]
async fn update_locked_icp_e8s() {
    let initial_locked_icp_e8s = 50_000_000_000;
    let later_locked_icp_e8s = 90_000_000_000;

    // Step 1: Set up the environment.
    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    governance::testing::add_metrics_response_with_total_locked_e8s(later_locked_icp_e8s);

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    // Step 3: Call the code under test.
    tvl::update_locked_icp_e8s().await;

    // Step 4: Verify the state after calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), later_locked_icp_e8s);
}

#[tokio::test]
async fn update_locked_icp_e8s_with_call_error() {
    let initial_locked_icp_e8s = 50_000_000_000;

    // Step 1: Set up the environment.
    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    governance::testing::add_metrics_response(Err("Canister is stopped".to_string()));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    // Step 3: Call the code under test.
    tvl::update_locked_icp_e8s().await;

    // Step 4: Verify the state after calling the code under test.
    // The total locked ICP should not have been updated because of the error.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);
}

#[tokio::test]
async fn update_locked_icp_e8s_with_method_error() {
    let initial_locked_icp_e8s = 50_000_000_000;

    // Step 1: Set up the environment.
    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    governance::testing::add_metrics_response(Ok(Err(governance::GovernanceError {
        error_type: 123,
        error_message: "Some error message".to_string(),
    })));

    // Step 2: Verify the state before calling the code under test.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    // Step 3: Call the code under test.
    tvl::update_locked_icp_e8s().await;

    // Step 4: Verify the state after calling the code under test.
    // The total locked ICP should not have been updated because of the error.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);
}
