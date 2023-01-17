use crate::canisters::xrc::candid::AssetClass::Cryptocurrency;
use crate::canisters::xrc::candid::{Asset, GetExchangeRateRequest, GetExchangeRateResult};
use crate::canisters::xrc::constants::{QUOTE_USD, RATE_ICP, XRC_CANISTER_ID};
use dfn_candid::candid;
use dfn_core::api::ic0::time;
use dfn_core::call;
use ic_base_types::CanisterId;
use std::str::FromStr;

pub async fn fetch_exchange_rate(
    base_symbol: &Option<String>,
    quote_symbol: &Option<String>,
) -> Result<GetExchangeRateResult, String> {
    let now;
    unsafe {
        now = time();
    };

    let request = GetExchangeRateRequest {
        timestamp: Some(now),
        quote_asset: Asset {
            symbol: quote_symbol.clone().unwrap_or_else(|| QUOTE_USD.to_string()),
            class: Cryptocurrency,
        },
        base_asset: Asset {
            symbol: base_symbol.clone().unwrap_or_else(|| RATE_ICP.to_string()),
            class: Cryptocurrency,
        },
    };

    let canister_id = CanisterId::from_str(XRC_CANISTER_ID).unwrap();
    call(canister_id, "get_exchange_rate", candid, (request,))
        .await
        .map_err(|e| e.1)
}
