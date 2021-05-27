use candid::CandidType;
use dfn_candid::candid;
use dfn_core::api::PrincipalId;
use ic_nns_constants::GOVERNANCE_CANISTER_ID;
use serde::Deserialize;

pub async fn claim_or_refresh_neuron_from_account(
    request: ClaimOrRefreshNeuronFromAccount) -> Result<ClaimOrRefreshNeuronFromAccountResponse, String> {

    dfn_core::call(
        GOVERNANCE_CANISTER_ID,
        "claim_or_refresh_neuron_from_account",
        candid,
        (request,)).await.map_err(|e| e.1)
}

/// The arguments to the method `claim_or_refresh_neuron_from_account`.
#[derive(Clone, PartialEq, CandidType, Deserialize)]
pub struct ClaimOrRefreshNeuronFromAccount {
    /// The principal for which to refresh the account. If not specified,
    /// defaults to the caller.
    pub controller: ::core::option::Option<PrincipalId>,
    /// The memo of the staking transaction.
    pub memo: u64,
}
/// Response to claim_or_refresh_neuron_from_account.
#[derive(Clone, PartialEq, CandidType, Deserialize)]
pub struct ClaimOrRefreshNeuronFromAccountResponse {
    //pub result: ::core::option::Option<claim_or_refresh_neuron_from_account_response::Result>,
}
/// Nested message and enum types in `ClaimOrRefreshNeuronFromAccountResponse`.
pub mod claim_or_refresh_neuron_from_account_response {
    use candid::{CandidType, Deserialize};
    #[derive(Clone, PartialEq, CandidType, Deserialize)]
    pub enum Result {
        /// Specified in case of error.
        Error(super::GovernanceError),
        /// The ID of the neuron that was created or empty in the case of error.
        NeuronId(::ic_nns_common::pb::v1::NeuronId),
    }
}

#[derive(Clone, PartialEq, CandidType, Deserialize)]
pub struct GovernanceError {
    pub error_type: i32,
    pub error_message: String,
}
