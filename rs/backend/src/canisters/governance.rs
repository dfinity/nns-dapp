pub use ic_nns_governance::pb::v1::{governance::GovernanceCachedMetrics, GovernanceError};

#[cfg(not(test))]
pub use prod::get_metrics;

#[cfg(test)]
pub use testing::get_metrics;

type GetMetricsCallResult = Result<Result<GovernanceCachedMetrics, GovernanceError>, String>;

#[cfg(not(test))]
mod prod {
    use super::{GetMetricsCallResult, GovernanceCachedMetrics, GovernanceError};
    use ic_nns_constants::GOVERNANCE_CANISTER_ID;

    pub async fn get_metrics() -> GetMetricsCallResult {
        ic_cdk::call(GOVERNANCE_CANISTER_ID.into(), "get_metrics", ())
            .await
            .map(|r: (Result<GovernanceCachedMetrics, GovernanceError>,)| r.0)
            .map_err(|e| e.1)
    }
}

#[cfg(test)]
pub mod testing {
    use super::*;
    use std::{cell::RefCell, collections::VecDeque};

    thread_local! {
        pub static RESPONSES:
        RefCell<VecDeque<GetMetricsCallResult>> = RefCell::default();
    }

    pub async fn get_metrics() -> GetMetricsCallResult {
        RESPONSES.with(|responses| {
            responses
                .borrow_mut()
                .pop_front()
                .expect("The test must provide a response before each call to get_metrics.")
        })
    }

    pub fn add_metrics_response(response: GetMetricsCallResult) {
        RESPONSES.with(|responses| responses.borrow_mut().push_back(response));
    }

    pub fn add_metrics_response_with_total_locked_e8s(total_locked_e8s: u64) {
        let response = Ok(Ok(GovernanceCachedMetrics {
            // total_locked_e8s is the only field our code cares about.
            total_locked_e8s,
            ..GovernanceCachedMetrics::default()
        }));
        add_metrics_response(response);
    }
}
