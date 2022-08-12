use crate::Cycles;
use dfn_candid::candid;
use dfn_core::CanisterId;
use candid::CandidType;
use cycles_minting_canister::{NotifyError};
// TODO: Install, import and use SNS Swap Canister response types

#[derive(CandidType)]
pub struct RefreshBuyersTokensRequest {
  pub buyer: String,
}

pub async fn notify_swap_participation(canister_id: CanisterId, request: RefreshBuyersTokensRequest) -> Result<Result<Cycles, NotifyError>, String> {
  dfn_core::call(canister_id, "refresh_buyer_tokens", candid, (request,))
    .await
    .map_err(|e| e.1)
}
