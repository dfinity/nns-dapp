use dfn_candid::candid;
use dfn_core::CanisterId;
use ic_sns_swap::pb::v1::RefreshBuyerTokensRequest;

pub async fn notify_swap_participation(
    canister_id: CanisterId,
    request: RefreshBuyerTokensRequest,
) -> Result<Result<(), String>, String> {
    dfn_core::call(canister_id, "refresh_buyer_tokens", candid, (request,))
        .await
        .map_err(|e| e.1)
}
