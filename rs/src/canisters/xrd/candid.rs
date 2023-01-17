/// Source: https://github.com/dfinity/exchange-rate-canister/blob/main/src/xrc/src/candid.rs
use candid::CandidType;
use serde::Deserialize;

/// The enum defining the different asset classes.
#[derive(CandidType, Clone, Debug, Deserialize, PartialEq)]
pub enum AssetClass {
    /// The cryptocurrency asset class.
    Cryptocurrency,
    /// The fiat currency asset class.
    FiatCurrency,
}

/// Exchange rates are derived for pairs of assets captured in this struct.
#[derive(CandidType, Clone, Debug, Deserialize, PartialEq)]
pub struct Asset {
    /// The symbol/code of the asset.
    pub symbol: String,
    /// The asset class.
    pub class: AssetClass,
}

/// The type the user sends when requesting a rate.
#[derive(CandidType, Clone, Debug, Deserialize)]
pub struct GetExchangeRateRequest {
    /// The asset to be used as the resulting asset. For example, using
    /// ICP/USD, ICP would be the base asset.
    pub base_asset: Asset,
    /// The asset to be used as the starting asset. For example, using
    /// ICP/USD, USD would be the quote asset.
    pub quote_asset: Asset,
    /// An optional parameter used to find a rate at a specific time.
    pub timestamp: Option<u64>,
}

/// Metadata information to give background on how the rate was determined.
#[derive(CandidType, Clone, Debug, Deserialize, PartialEq)]
pub struct ExchangeRateMetadata {
    /// The scaling factor for the exchange rate and the standard deviation.
    pub decimals: u32,
    /// The number of queried exchanges for the base asset.
    pub base_asset_num_queried_sources: usize,
    /// The number of rates successfully received from the queried sources for the base asset.
    pub base_asset_num_received_rates: usize,
    /// The number of queried exchanges for the quote asset.
    pub quote_asset_num_queried_sources: usize,
    /// The number of rates successfully received from the queried sources for the quote asset.
    pub quote_asset_num_received_rates: usize,
    /// The standard deviation of the received rates, scaled by the factor `10^decimals`.
    pub standard_deviation: u64,
    /// The timestamp of the beginning of the day for which the forex rates were retrieved, if any.
    pub forex_timestamp: Option<u64>,
}

/// When a rate is determined, this struct is used to present the information
/// to the user.
#[derive(CandidType, Clone, Debug, Deserialize, PartialEq)]
pub struct ExchangeRate {
    /// The base asset.
    pub base_asset: Asset,
    /// The quote asset.
    pub quote_asset: Asset,
    /// The timestamp associated with the returned rate.
    pub timestamp: u64,
    /// The median rate from the received rates, scaled by the factor `10^decimals` in the metadata.
    pub rate: u64,
    /// Metadata providing additional information about the exchange rate calculation.
    pub metadata: ExchangeRateMetadata,
}

/// Returned to the user when something goes wrong retrieving the exchange rate.
#[derive(CandidType, Clone, Debug, Deserialize)]
pub enum ExchangeRateError {
    /// Returned when the canister receives a call from the anonymous principal.
    AnonymousPrincipalNotAllowed,
    /// Returned when the base asset rates are not found from the exchanges HTTP outcalls.
    CryptoBaseAssetNotFound,
    /// Returned when the quote asset rates are not found from the exchanges HTTP outcalls.
    CryptoQuoteAssetNotFound,
    /// Returned when the stablecoin rates are not found from the exchanges HTTP outcalls needed for computing a crypto/fiat pair.
    StablecoinRateNotFound,
    /// Returned when there are not enough stablecoin rates to determine the forex/USDT rate.
    StablecoinRateTooFewRates,
    /// Returned when the stablecoin rate is zero.
    StablecoinRateZeroRate,
    /// Returned when a rate for the provided forex asset could not be found at the provided timestamp.
    ForexInvalidTimestamp,
    /// Returned when the forex base asset is found.
    ForexBaseAssetNotFound,
    /// Returned when the forex quote asset is found.
    ForexQuoteAssetNotFound,
    /// Returned when neither forex asset is found.
    ForexAssetsNotFound,
    /// Returned when the caller is not the CMC and there are too many active requests.
    RateLimited,
    /// Returned when the caller does not send enough cycles to make a request.
    NotEnoughCycles,
    /// Returned if too many collected rates deviate substantially.
    InconsistentRatesReceived,
    /// Until candid bug is fixed, new errors after launch will be placed here.
    Other(OtherError),
}

/// Used to provide details for the [ExchangeRateError::Other] variant field.
#[derive(CandidType, Clone, Debug, Deserialize)]
pub struct OtherError {
    /// The identifier for the error that occurred.
    pub code: u32,
    /// A description of the error that occurred.
    pub description: String,
}

/// Short-hand for returning the result of a `get_exchange_rate` request.
pub type GetExchangeRateResult = Result<ExchangeRate, ExchangeRateError>;
