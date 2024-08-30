use crate::{canisters::governance, state::STATE};

pub mod state;

// TODO(NNS1-3281): Remove #[allow(unused)].
#[allow(unused)]
pub async fn update_locked_icp_e8s() {
    let metrics_result = governance::get_metrics().await;
    STATE.with(|s| {
        match metrics_result {
            Ok(Ok(metrics)) => {
                s.tvl_state.borrow_mut().total_locked_icp_e8s = metrics.total_locked_e8s;
                ic_cdk::println!("Updated total_locked_icp_e8s for TVL to {}", metrics.total_locked_e8s);
            }
            Ok(Err(err)) => {
                ic_cdk::println!(
                    "Keeping total_locked_icp_e8s for TVL at {} because of response error: {}",
                    s.tvl_state.borrow().total_locked_icp_e8s,
                    err
                );
            }
            Err(err) => {
                ic_cdk::println!(
                    "Keeping total_locked_icp_e8s for TVL at {} because of call error: {}",
                    s.tvl_state.borrow().total_locked_icp_e8s,
                    err
                );
            }
        };
    });
}

#[cfg(test)]
pub(crate) mod tests;
