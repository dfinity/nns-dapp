use dfn_candid::candid;
use ic_nns_constants::GOVERNANCE_CANISTER_ID;
use ic_nns_governance::pb::v1::{ClaimOrRefreshNeuronFromAccount, ClaimOrRefreshNeuronFromAccountResponse};

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
