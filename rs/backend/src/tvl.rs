use crate::{
    canisters::{governance, xrc},
    state::STATE,
    time,
};

pub mod state;

const SEC_NANOS: u64 = 1_000_000_000;
const XRC_MARGIN_SEC: u64 = 60 * 5;

// TODO(NNS1-3281): Remove #[allow(unused)].
#[allow(unused)]
pub async fn update_exchange_rate() {
    // Take few minutes back to be sure to have data.
    let timestamp_sec = time::time() / SEC_NANOS - XRC_MARGIN_SEC;

    let usd = xrc::Asset {
        symbol: "USD".to_string(),
        class: xrc::AssetClass::FiatCurrency,
    };
    let icp = xrc::Asset {
        symbol: "ICP".to_string(),
        class: xrc::AssetClass::Cryptocurrency,
    };

    // Retrieve last ICP/USD value.
    let args = xrc::GetExchangeRateRequest {
        base_asset: icp,
        quote_asset: usd,
        timestamp: Some(timestamp_sec),
    };

    let xrc_result: Result<xrc::GetExchangeRateResult, String> = xrc::get_exchange_rate(args).await;
    STATE.with(|s| {
        match xrc_result {
            Ok(xrc::GetExchangeRateResult::Ok(exchange_rate)) => {
                let xrc::ExchangeRate {
                    rate: usd_per_icp_e8s,
                    timestamp,
                    ..
                } = exchange_rate;
                s.tvl_state.borrow_mut().usd_per_icp_e8s = usd_per_icp_e8s;
                s.tvl_state.borrow_mut().exchange_rate_timestamp_sec = timestamp;
                ic_cdk::println!("Updated usd_per_icp_e8s for TVL to {}", usd_per_icp_e8s);
            }
            Ok(xrc::GetExchangeRateResult::Err(err)) => {
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
