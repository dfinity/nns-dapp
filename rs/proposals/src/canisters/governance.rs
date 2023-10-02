// TODO: Rename as nns_governance

use api::ProposalInfo;
use dfn_candid::candid;
use ic_nns_constants::GOVERNANCE_CANISTER_ID;

pub mod api;
pub mod internal;

pub async fn get_proposal_info(proposal_id: u64) -> Result<Option<ProposalInfo>, String> {
    dfn_core::call(GOVERNANCE_CANISTER_ID, "get_proposal_info", candid, (proposal_id,))
        .await
        .map_err(|e| e.1)
}
