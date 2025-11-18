import { tickerProviderStore } from "$lib/stores/ticker-provider.store";
import { derived } from "svelte/store";

export const tickersProviderName = derived(
  [tickerProviderStore],
  ([provider]) => {
    if (provider === "icp-swap") return "ICPSwap";
    if (provider === "kong-swap") return "KongSwap";
    return "Unknown";
  }
);
