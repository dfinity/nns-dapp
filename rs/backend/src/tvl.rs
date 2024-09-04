use crate::{
    canisters::{exchange_rate_canister, governance},
    constants::NANOS_PER_UNIT,
    spawn,
    state::STATE,
    time,
    timer::{set_timer, set_timer_interval},
};
use std::time::Duration;

pub mod state;

const XRC_MARGIN_SECONDS: u64 = 60 * 5;
const UPDATE_INTERVAL_SECONDS: u64 = 6 * 60 * 60; // 4 times a day

// TODO(NNS1-3281): Remove #[allow(unused)].
#[allow(unused)]
pub fn init_exchange_rate_timers() {
    set_timer_interval(Duration::from_secs(UPDATE_INTERVAL_SECONDS), || {
        spawn::spawn(update_exchange_rate());
    });
    // `set_timer_interval` does not run the callback immediately so we also
    // call it after 1 second to have an exchange rate available soon.
    set_timer(Duration::from_secs(1), || {
        spawn::spawn(update_exchange_rate());
    });
}

// TODO(NNS1-3281): Remove #[allow(unused)].
#[allow(unused)]
fn init_locked_icp_timers() {
    set_timer_interval(Duration::from_secs(UPDATE_INTERVAL_SECONDS), || {
        spawn::spawn(update_locked_icp_e8s());
    });
    // `set_timer_interval` does not run the callback immediately so we also
    // call it after 1 second to have an exchange rate available soon.
    set_timer(Duration::from_secs(1), || {
        spawn::spawn(update_locked_icp_e8s());
    });
}

/// Converts a number such that it can be interpreted as a fixed-point number
/// with 8 decimal places.
///
/// For example, if `amount` is 123 and `decimals` is 2, the input is
/// interpreted as 1.23, by moving the decimal point 2 positions to the left.
/// In the output, we want to represent this with 8 decimals instead of 2, so
/// from 1.23 we move the decimal point 8 positions to the right to get
/// `123_000_000`.
fn convert_to_e8s(amount: u64, decimals: u32) -> u64 {
    // Copied from https://github.com/dfinity/ic/blob/6760029ea4e9be8170984b023391cb72ff3b6398/rs/rosetta-api/tvl/src/lib.rs#L166C1-L174C6
    if decimals >= 8 {
        // If there are at least 8 decimal places, divide by 10^(decimals - 8)
        // to shift the decimal point to the left.
        amount / 10u64.pow(decimals - 8)
    } else {
        // If there are fewer than 8 decimal places, multiply by 10^(8 - decimals)
        // to shift the decimal point to the right.
        amount * 10u64.pow(8 - decimals)
    }
}

// TODO(NNS1-3281): Remove #[allow(unused)].
#[allow(unused)]
pub async fn update_exchange_rate() {
    // We query XRC data slightly in the past to be sure to have a price with consensus.
    //
    // NOTE: The API suggests we could just not specify a timestamp in order to
    // get the latest available exchange rate. But this is how it was
    // implemented in the TVL canister, so we stick to this, at least for now.
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
    let exchange_rate = match xrc_result {
        Ok(exchange_rate_canister::GetExchangeRateResult::Ok(exchange_rate)) => exchange_rate,
        Ok(exchange_rate_canister::GetExchangeRateResult::Err(err)) => {
            STATE.with(|s| {
                ic_cdk::println!(
                    "Keeping usd_e8s_per_icp for TVL at {} because of response error: {:?}",
                    s.tvl_state.borrow().usd_e8s_per_icp,
                    err
                );
            });
            return;
        }
        Err(err) => {
            STATE.with(|s| {
                ic_cdk::println!(
                    "Keeping usd_e8s_per_icp for TVL at {} because of call error: {:?}",
                    s.tvl_state.borrow().usd_e8s_per_icp,
                    err
                );
            });
            return;
        }
    };

    let exchange_rate_canister::ExchangeRate {
        rate,
        timestamp,
        metadata,
        ..
    } = exchange_rate;
    let decimals = metadata.decimals;
    let usd_e8s_per_icp = convert_to_e8s(rate, decimals);
    STATE.with(|s| {
        s.tvl_state.borrow_mut().usd_e8s_per_icp = usd_e8s_per_icp;
        s.tvl_state.borrow_mut().exchange_rate_timestamp_seconds = timestamp;
    });
    ic_cdk::println!("Updated usd_e8s_per_icp for TVL to {}", usd_e8s_per_icp);
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
