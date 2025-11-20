import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
import { TICKERS_PROVIDER_NAMES } from "$lib/types/tickers";
import { derived } from "svelte/store";

export const tickersProviderName = derived(
  [tickerProviderStore],
  ([provider]) => provider ? TICKERS_PROVIDER_NAMES[provider] : undefined
);
