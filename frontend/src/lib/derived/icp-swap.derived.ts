import { tickersStore } from "$lib/stores/tickers.store";
import { type Readable } from "svelte/store";

export type IcpSwapUsdPricesStoreData =
  | Record<string, number>
  | undefined
  | "error";

export type IcpSwapUsdPricesStore = Readable<IcpSwapUsdPricesStoreData>;

// Temporarily re-exporting the tickers store until we have multiple providers.
export const icpSwapUsdPricesStore: IcpSwapUsdPricesStore = tickersStore;
