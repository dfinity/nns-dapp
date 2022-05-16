use crate::Cycles;
use cycles_minting_canister::{NotifyCreateCanister, NotifyError, NotifyTopUp};
use dfn_candid::candid;
use dfn_core::CanisterId;
use ic_nns_constants::CYCLES_MINTING_CANISTER_ID;

pub async fn notify_create_canister(request: NotifyCreateCanister) -> Result<Result<CanisterId, NotifyError>, String> {
    dfn_core::call(CYCLES_MINTING_CANISTER_ID, "notify_create_canister", candid, (request,))
        .await
        .map_err(|e| e.1)
}

pub async fn notify_top_up_canister(request: NotifyTopUp) -> Result<Result<Cycles, NotifyError>, String> {
    dfn_core::call(CYCLES_MINTING_CANISTER_ID, "notify_top_up", candid, (request,))
        .await
        .map_err(|e| e.1)
}
