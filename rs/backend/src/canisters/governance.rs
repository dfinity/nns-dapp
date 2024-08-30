use dfn_candid::candid;
use ic_nns_constants::GOVERNANCE_CANISTER_ID;
pub use ic_nns_governance::pb::v1::{
    governance::GovernanceCachedMetrics, ClaimOrRefreshNeuronFromAccount, ClaimOrRefreshNeuronFromAccountResponse,
    GovernanceError,
};

pub async fn claim_or_refresh_neuron_from_account(
    request: ClaimOrRefreshNeuronFromAccount,
) -> Result<ClaimOrRefreshNeuronFromAccountResponse, String> {
    dfn_core::call(
        GOVERNANCE_CANISTER_ID,
        "claim_or_refresh_neuron_from_account",
        candid,
        (request,),
    )
    .await
    .map_err(|e| e.1)
}

#[cfg(not(test))]
pub use prod::get_metrics;

#[cfg(test)]
pub use testing::get_metrics;

type GetMetricsCallResult = Result<Result<GovernanceCachedMetrics, GovernanceError>, String>;

#[cfg(not(test))]
mod prod {
    use super::{candid, GetMetricsCallResult, GOVERNANCE_CANISTER_ID};

    pub async fn get_metrics() -> GetMetricsCallResult {
        dfn_core::call(GOVERNANCE_CANISTER_ID, "get_metrics", candid, ())
            .await
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
