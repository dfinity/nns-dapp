import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKUSDC_LEDGER_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
import { tickersStore } from "$lib/stores/tickers.store";
import type { TickersProviders } from "$lib/types/tickers";

const isIcpPriceInvalid = (price: number) => Number.isNaN(price) || price <= 0;

// Sets the contents of the tickersStore such that the result is the
// given map from ledger canister IDs to their USD prices.
// Unless specified otherwise, the price of ICP is set to 10 USD.
// The price of ckUSDC is always set to 1 USD.
export const setTickers = (prices: Record<string, number>) => {
  const defaultIcpPrice = 10;
  const filteredPrices = Object.fromEntries(
    Object.entries(prices).filter(([_, price]) => price !== undefined)
  ) as Record<string, number>;

  const tickers = {
    [LEDGER_CANISTER_ID.toText()]: defaultIcpPrice,
    [CKUSDC_LEDGER_CANISTER_ID.toText()]: 1,
    ...filteredPrices,
  };

  tickersStore.set(tickers);
};

export const setIcpPrice = (icpPrice: number) => {
  if (isIcpPriceInvalid(icpPrice)) return tickersStore.set("error");

  setTickers({
    [LEDGER_CANISTER_ID.toText()]: icpPrice,
  });
};

export const setTickersProvider = (provider: TickersProviders) =>
  tickerProviderStore.set(provider);
