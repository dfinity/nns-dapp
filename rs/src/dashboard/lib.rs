use crate::canisters::xrc::candid::ExchangeRate;
use crate::canisters::xrc::canister::fetch_exchange_rate as fetch_exchange_rate_call;
use crate::canisters::xrc::constants::{QUOTE_USD, RATE_ICP};
use crate::dashboard::types::interface::FetchExchangeRateArgs;
use crate::state::STATE;

pub fn get_exchange_rate_impl(key: String) -> Option<ExchangeRate> {
    STATE.with(|s| s.dashboard.borrow().get_exchange_rate(&key))
}

pub async fn fetch_exchange_rate_impl(
    FetchExchangeRateArgs {
        base_symbol,
        quote_symbol,
    }: FetchExchangeRateArgs,
) -> Result<ExchangeRate, String> {
    let result = fetch_exchange_rate_call(&base_symbol, &quote_symbol).await?;

    match result {
        Err(error) => Err(format!("Exchange rate cannot be queried: {:?}", error)),
        Ok(exchange_rate) => {
            set_exchange_rate_impl(&base_symbol, &quote_symbol, &exchange_rate);

            Ok(exchange_rate)
        }
    }
}

fn set_exchange_rate_impl(base_symbol: &Option<String>, quote_symbol: &Option<String>, rate: &ExchangeRate) {
    let key = [
        base_symbol.clone().unwrap_or_else(|| RATE_ICP.to_string()),
        "-".to_string(),
        quote_symbol.clone().unwrap_or_else(|| QUOTE_USD.to_string()),
    ]
    .join("");
    STATE.with(|s| s.dashboard.borrow_mut().set_exchange_rate(&key, rate));
}
