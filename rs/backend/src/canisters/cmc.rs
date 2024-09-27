use crate::Cycles;
use cycles_minting_canister::{NotifyCreateCanister, NotifyError, NotifyTopUp};
use ic_base_types::CanisterId;
use ic_nns_constants::CYCLES_MINTING_CANISTER_ID;

pub async fn notify_create_canister(request: NotifyCreateCanister) -> Result<Result<CanisterId, NotifyError>, String> {
    ic_cdk::call(CYCLES_MINTING_CANISTER_ID.into(), "notify_create_canister", (request,))
        .await
        .map_err(|e| e.1)
}

pub async fn notify_top_up_canister(request: NotifyTopUp) -> Result<Result<Cycles, NotifyError>, String> {
    ic_cdk::call(CYCLES_MINTING_CANISTER_ID.into(), "notify_top_up", (request,))
        .await
        .map_err(|e| e.1)
}
