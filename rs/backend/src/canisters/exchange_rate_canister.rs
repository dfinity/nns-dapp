use candid::CandidType;

#[cfg(not(test))]
pub use prod::get_exchange_rate;

#[cfg(test)]
pub use testing::get_exchange_rate;

// Types copied from https://github.com/dfinity/ic/blob/cf237434877b39d0a94fb5ef84b13ea576a225ac/rs/rosetta-api/tvl/src/types.rs#L35-L121

#[derive(CandidType, Clone, Debug, candid::Deserialize, PartialEq, Eq)]
pub enum AssetClass {
    Cryptocurrency,
    FiatCurrency,
}

#[derive(CandidType, Clone, Debug, candid::Deserialize, PartialEq, Eq)]
pub struct Asset {
    pub symbol: String,
    pub class: AssetClass,
}

#[derive(CandidType, Clone, Debug, candid::Deserialize, PartialEq, Eq)]
pub struct GetExchangeRateRequest {
    pub base_asset: Asset,
    pub quote_asset: Asset,
    // An optional timestamp to get the rate for a specific time period.
    pub timestamp: Option<u64>,
}

#[derive(CandidType, Clone, Debug, Default, candid::Deserialize, PartialEq, Eq)]
pub struct ExchangeRateMetadata {
    pub decimals: u32,
    pub base_asset_num_received_rates: u64,
    pub base_asset_num_queried_sources: u64,
    pub quote_asset_num_received_rates: u64,
    pub quote_asset_num_queried_sources: u64,
    pub standard_deviation: u64,
    pub forex_timestamp: Option<u64>,
}

#[derive(CandidType, Clone, Debug, candid::Deserialize, PartialEq, Eq)]
pub struct ExchangeRate {
    pub base_asset: Asset,
    pub quote_asset: Asset,
    pub timestamp: u64,
    pub rate: u64,
    pub metadata: ExchangeRateMetadata,
}

#[derive(CandidType, Clone, Debug, candid::Deserialize, PartialEq, Eq)]
pub enum ExchangeRateError {
    // Returned when the canister receives a call from the anonymous principal.
    AnonymousPrincipalNotAllowed,
    /// Returned when the canister is in process of retrieving a rate from an exchange.
    Pending,
    // Returned when the base asset rates are not found from the exchanges HTTP outcalls.
    CryptoBaseAssetNotFound,
    // Returned when the quote asset rates are not found from the exchanges HTTP outcalls.
    CryptoQuoteAssetNotFound,
    // Returned when the stablecoin rates are not found from the exchanges HTTP outcalls needed for computing a crypto/fiat pair.
    StablecoinRateNotFound,
    // Returned when there are not enough stablecoin rates to determine the forex/USDT rate.
    StablecoinRateTooFewRates,
    // Returned when the stablecoin rate is zero.
    StablecoinRateZeroRate,
    // Returned when a rate for the provided forex asset could not be found at the provided timestamp.
    ForexInvalidTimestamp,
    // Returned when the forex base asset is found.
    ForexBaseAssetNotFound,
    // Returned when the forex quote asset is found.
    ForexQuoteAssetNotFound,
    // Returned when neither forex asset is found.
    ForexAssetsNotFound,
    // Returned when the caller is not the CMC and there are too many active requests.
    RateLimited,
    // Returned when the caller does not send enough cycles to make a request.
    NotEnoughCycles,
    // Returned when the canister fails to accept enough cycles.
    FailedToAcceptCycles,
    /// Returned if too many collected rates deviate substantially.
    InconsistentRatesReceived,
    // Until candid bug is fixed, new errors after launch will be placed here.
    Other {
        code: u32,
        description: String,
    },
}

#[derive(CandidType, Clone, Debug, candid::Deserialize, PartialEq, Eq)]
pub enum GetExchangeRateResult {
    // Successfully retrieved the exchange rate from the cache or API calls.
    Ok(ExchangeRate),
    // Failed to retrieve the exchange rate due to invalid API calls, invalid timestamp, etc.
    Err(ExchangeRateError),
}

#[cfg(not(test))]
mod prod {
    use super::{GetExchangeRateRequest, GetExchangeRateResult};
    use ic_nns_constants::EXCHANGE_RATE_CANISTER_ID;

    pub async fn get_exchange_rate(request: GetExchangeRateRequest) -> Result<GetExchangeRateResult, String> {
        ic_cdk::call::<(GetExchangeRateRequest,), (GetExchangeRateResult,)>(
            EXCHANGE_RATE_CANISTER_ID.into(),
            "get_exchange_rate",
            (request,),
        )
        .await
        .map(|r: (GetExchangeRateResult,)| r.0)
        .map_err(|e| e.1)
    }
}

#[cfg(test)]
pub mod testing {
    use super::*;
    use std::{cell::RefCell, collections::VecDeque};

    thread_local! {
        pub static REQUESTS: RefCell<VecDeque<GetExchangeRateRequest>> =
        RefCell::default();
        pub static RESPONSES: RefCell<VecDeque<Result<GetExchangeRateResult, String>>> = RefCell::default();
    }

    pub async fn get_exchange_rate(request: GetExchangeRateRequest) -> Result<GetExchangeRateResult, String> {
        let response = RESPONSES.with(|responses| {
            responses
                .borrow_mut()
                .pop_front()
                .expect("The test must provide a response before get_exchange_rate is called.")
        });

        // Assert that request matches response.
        if let Ok(GetExchangeRateResult::Ok(response)) = &response {
            assert_eq!(request.base_asset, response.base_asset);
            assert_eq!(request.quote_asset, response.quote_asset);
            if let Some(timestamp) = request.timestamp {
                assert_eq!(timestamp, response.timestamp);
            }
        }
        REQUESTS.with(|requests| {
            requests.borrow_mut().push_back(request);
        });
        response
    }

    pub fn drain_requests() -> Vec<GetExchangeRateRequest> {
        REQUESTS.with(|requests| requests.borrow_mut().drain(..).collect())
    }

    pub fn add_exchange_rate_response(response: Result<GetExchangeRateResult, String>) {
        RESPONSES.with(|responses| responses.borrow_mut().push_back(response));
    }

    pub fn add_exchange_rate_response_ok(
        base_asset: Asset,
        quote_asset: Asset,
        rate_e8s: u64,
        decimals: u32,
        timestamp_seconds: u64,
    ) {
        let response = Ok(GetExchangeRateResult::Ok(ExchangeRate {
            base_asset,
            quote_asset,
            timestamp: timestamp_seconds,
            rate: rate_e8s,
            metadata: ExchangeRateMetadata {
                decimals,
                // The details of the metadata are not important because this is
                // part of the response that our code doesn't look at.
                ..ExchangeRateMetadata::default()
            },
        }));
        add_exchange_rate_response(response);
    }
}
