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

    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    governance::testing::add_metrics_response_with_total_locked_e8s(later_locked_icp_e8s);

    tvl::update_locked_icp_e8s().await;

    assert_eq!(get_total_locked_icp_e8s(), later_locked_icp_e8s);
}

#[tokio::test]
async fn update_locked_icp_e8s_with_call_error() {
    let initial_locked_icp_e8s = 50_000_000_000;

    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    governance::testing::add_metrics_response(Err("Canister is stopped".to_string()));

    tvl::update_locked_icp_e8s().await;

    // The total locked ICP should not have been updated because of the error.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);
}

#[tokio::test]
async fn update_locked_icp_e8s_with_method_error() {
    let initial_locked_icp_e8s = 50_000_000_000;

    set_total_locked_icp_e8s(initial_locked_icp_e8s);
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);

    governance::testing::add_metrics_response(Ok(Err(governance::GovernanceError {
        error_type: 123,
        error_message: "Some error message".to_string(),
    })));

    tvl::update_locked_icp_e8s().await;

    // The total locked ICP should not have been updated because of the error.
    assert_eq!(get_total_locked_icp_e8s(), initial_locked_icp_e8s);
}
