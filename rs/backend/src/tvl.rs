use crate::{
    canisters::{exchange_rate_canister, governance},
    constants::NANOS_PER_UNIT,
    state::STATE,
    time,
};

pub mod state;

const XRC_MARGIN_SECONDS: u64 = 60 * 5;

// TODO(NNS1-3281): Remove #[allow(unused)].
#[allow(unused)]
pub async fn update_exchange_rate() {
    // We query XRC data slightly in the past to be sure to have a price with consensus.
    //
    // NOTE: The API suggests we could just not specify a timestamp in order to
    // get the latest available exchange rate. But this is how it was
    // implemented in the TVL canister to we stick to this, at least for now.
    // See https://github.com/dfinity/ic/blob/6760029ea4e9be8170984b023391cb72ff3b6398/rs/rosetta-api/tvl/src/lib.rs#L30
    let timestamp_seconds = time::time() / NANOS_PER_UNIT - XRC_MARGIN_SECONDS;

    let usd = exchange_rate_canister::Asset {
        symbol: "USD".to_string(),
        class: exchange_rate_canister::AssetClass::FiatCurrency,
    };
    let icp = exchange_rate_canister::Asset {
        symbol: "ICP".to_string(),
        class: exchange_rate_canister::AssetClass::Cryptocurrency,
    };

    // Retrieve last ICP/USD value.
    let args = exchange_rate_canister::GetExchangeRateRequest {
        base_asset: icp,
        quote_asset: usd,
        timestamp: Some(timestamp_seconds),
    };

    let xrc_result: Result<exchange_rate_canister::GetExchangeRateResult, String> =
        exchange_rate_canister::get_exchange_rate(args).await;
    STATE.with(|s| {
        match xrc_result {
            Ok(exchange_rate_canister::GetExchangeRateResult::Ok(exchange_rate)) => {
                let exchange_rate_canister::ExchangeRate {
                    rate: usd_per_icp_e8s,
                    timestamp,
                    ..
                } = exchange_rate;
                s.tvl_state.borrow_mut().usd_per_icp_e8s = usd_per_icp_e8s;
                s.tvl_state.borrow_mut().exchange_rate_timestamp_seconds = timestamp;
                ic_cdk::println!("Updated usd_per_icp_e8s for TVL to {}", usd_per_icp_e8s);
            }
            Ok(exchange_rate_canister::GetExchangeRateResult::Err(err)) => {
                ic_cdk::println!(
                    "Keeping usd_per_icp_e8s for TVL at {} because of response error: {:?}",
                    s.tvl_state.borrow().usd_per_icp_e8s,
                    err
                );
            }
            Err(err) => {
                ic_cdk::println!(
                    "Keeping usd_per_icp_e8s for TVL at {} because of call error: {:?}",
                    s.tvl_state.borrow().usd_per_icp_e8s,
                    err
                );
            }
        };
    });
}

// TODO(NNS1-3281): Remove #[allow(unused)].
#[allow(unused)]
pub async fn update_locked_icp_e8s() {
    let metrics_result = governance::get_metrics().await;
    STATE.with(|s| {
        match metrics_result {
            Ok(Ok(metrics)) => {
                s.tvl_state.borrow_mut().total_locked_icp_e8s = metrics.total_locked_e8s;
                ic_cdk::println!("Updated total_locked_icp_e8s for TVL to {}", metrics.total_locked_e8s);
            }
            Ok(Err(err)) => {
                ic_cdk::println!(
                    "Keeping total_locked_icp_e8s for TVL at {} because of response error: {}",
                    s.tvl_state.borrow().total_locked_icp_e8s,
                    err
                );
            }
            Err(err) => {
                ic_cdk::println!(
                    "Keeping total_locked_icp_e8s for TVL at {} because of call error: {}",
                    s.tvl_state.borrow().total_locked_icp_e8s,
                    err
                );
            }
        };
    });
}

#[cfg(test)]
pub(crate) mod tests;
