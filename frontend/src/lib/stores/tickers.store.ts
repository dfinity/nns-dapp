import type { TickersStoreData } from "$lib/types/tickers";
import { writable, type Readable } from "svelte/store";

export interface TickersStore extends Readable<TickersStoreData> {
  set: (data: TickersStoreData) => void;
}

const initTickersStore = (): TickersStore => {
  const { subscribe, set } = writable<TickersStoreData>(undefined);

  return {
    subscribe,
    set,
  };
};

export const tickersStore = initTickersStore();
