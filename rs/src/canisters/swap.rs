use crate::Cycles;
use cycles_minting_canister::NotifyError;
use dfn_candid::candid;
use dfn_core::CanisterId;
use ic_sns_swap::pb::v1::RefreshBuyerTokensRequest;

pub async fn notify_swap_participation(
    canister_id: CanisterId,
    request: RefreshBuyerTokensRequest,
    // TODO: Remove Cycles and NotifyError types
    // Resposne is `record {}`
    // https://github.com/dfinity/ic/blob/master/rs/sns/swap/canister/swap.did#L92
) -> Result<Result<Cycles, NotifyError>, String> {
    dfn_core::call(canister_id, "refresh_buyer_tokens", candid, (request,))
        .await
        .map_err(|e| e.1)
}
