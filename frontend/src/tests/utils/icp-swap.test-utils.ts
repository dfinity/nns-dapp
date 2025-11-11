import {
  setIcpPrice as setIcpPriceInTickers,
  setTickers,
} from "$tests/utils/tickers.test-utils";

// TODO: Remove these re-exports and update imports in tests once all tests have been migrated.
export const setIcpSwapUsdPrices = setTickers;
export const setIcpPrice = setIcpPriceInTickers;
