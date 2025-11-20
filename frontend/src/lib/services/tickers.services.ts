import { icpSwapTickerProvider } from "$lib/services/icp-swap.provider";
import { kongSwapTickerProvider } from "$lib/services/kong-swap.provider";
import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
import { tickersStore } from "$lib/stores/tickers.store";
import { TickersProviders, type ProviderLoader } from "$lib/types/tickers";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const providers: TickersProviders[] = [
  TickersProviders.ICP_SWAP,
  TickersProviders.KONG_SWAP,
];
const providersLoaders = new Map<TickersProviders, ProviderLoader>([
  [TickersProviders.ICP_SWAP, icpSwapTickerProvider],
  [TickersProviders.KONG_SWAP, kongSwapTickerProvider],
]);

export const loadTickers = async (): Promise<void> => {
  // We keep the existing tickers for the duration of the session.
  if (get(tickersStore) !== undefined) return;

  for (const p of providers) {
    try {
      const provider = providersLoaders.get(p);
      if (isNullish(provider)) continue;

      const tickers = await provider();

      tickerProviderStore.set(p);
      return tickersStore.set(tickers);
    } catch (error) {
      console.error(error);
    }
  }

  // If all providers failed, set error state.
  tickerProviderStore.set(undefined);
  tickersStore.set("error");
};
