import type { TickersProviders } from "$lib/types/tickers";
import { writable, type Readable } from "svelte/store";

export interface TickerProviderStore
  extends Readable<TickersProviders | undefined> {
  set: (provider: TickersProviders | undefined) => void;
}

const initTickerProviderStore = (): TickerProviderStore => {
  const { subscribe, set } = writable<TickersProviders | undefined>(undefined);

  return {
    subscribe,
    set,
  };
};

export const tickerProviderStore = initTickerProviderStore();
