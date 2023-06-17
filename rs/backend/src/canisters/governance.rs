use dfn_candid::candid;
use ic_nns_constants::GOVERNANCE_CANISTER_ID;
use ic_nns_governance::pb::v1::{
    ClaimOrRefreshNeuronFromAccount, ClaimOrRefreshNeuronFromAccountResponse, ProposalInfo,
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

pub async fn get_proposal_info(proposal_id: u64) -> Result<Option<ProposalInfo>, String> {
    dfn_core::call(GOVERNANCE_CANISTER_ID, "get_proposal_info", candid, (proposal_id,))
        .await
        .map_err(|e| e.1)
}
