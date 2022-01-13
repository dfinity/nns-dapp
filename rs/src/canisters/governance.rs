use candid::CandidType;
use dfn_candid::candid;
use dfn_core::api::PrincipalId;
use ic_nns_constants::GOVERNANCE_CANISTER_ID;
use serde::Deserialize;
use std::convert::TryFrom;

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

pub async fn list_known_neurons() -> Result<ListKnownNeuronsResponse, String> {
    dfn_core::call(GOVERNANCE_CANISTER_ID, "list_known_neurons", candid, ((),))
        .await
        .map_err(|e| e.1)
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
    pub result: ::core::option::Option<claim_or_refresh_neuron_from_account_response::Result>,
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

/// A response to "ListKnownNeurons"
#[derive(Clone, PartialEq, CandidType, Deserialize)]
pub struct ListKnownNeuronsResponse {
    /// List of known neurons.
    pub known_neurons: Vec<KnownNeuron>,
}
#[derive(Clone, PartialEq, CandidType, Deserialize)]
pub struct KnownNeuron {
    pub id: Option<::ic_nns_common::pb::v1::NeuronId>,
    pub known_neuron_data: Option<KnownNeuronData>,
}
/// Known neurons have extra information (mainly a name) used to identify them.
#[derive(Clone, PartialEq, CandidType, Deserialize)]
pub struct KnownNeuronData {
    pub name: String,
    pub description: Option<String>,
}

impl TryFrom<KnownNeuron> for crate::KnownNeuron {
    type Error = String;

    fn try_from(value: KnownNeuron) -> Result<Self, Self::Error> {
        let id = value.id.ok_or("'id' is None".to_string())?.into();
        let data = value
            .known_neuron_data
            .ok_or("'known_neuron_data' is None".to_string())?;

        Ok(crate::KnownNeuron {
            id,
            name: data.name,
            description: data.description,
        })
    }
}
