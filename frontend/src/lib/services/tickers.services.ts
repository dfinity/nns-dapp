import { icpSwapTickerProvider } from "$lib/services/icp-swap.provider";
import { kongSwapTickerProvider } from "$lib/services/kong-swap.provider";
import { tickersStore } from "$lib/stores/tickers.store";
import type { ProviderLoader, TickersProviders } from "$lib/types/tickers";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const providers: TickersProviders[] = ["icp-swap", "kong-swap"];
const providersLoaders = new Map<TickersProviders, ProviderLoader>([
  ["icp-swap", icpSwapTickerProvider],
  ["kong-swap", kongSwapTickerProvider],
]);

export const loadTickers = async (): Promise<void> => {
  // We keep the existing tickers for the duration of the session.
  if (get(tickersStore) !== undefined) return;

  for (const p of providers) {
    try {
      const provider = providersLoaders.get(p);
      if (isNullish(provider)) continue;

      const tickers = await provider();

      return tickersStore.set(tickers);
    } catch (error) {
      console.error(error);
    }
  }

  // If all providers failed, set error state.
  tickersStore.set("error");
};
