import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { writable, type Readable } from "svelte/store";

/**
 * `undefined` means that the data is not loaded yet.
 */
export interface SnsAggregatorData {
  data: CachedSnsDto[] | undefined;
}

export interface SnsAggregatorStore extends Readable<SnsAggregatorData> {
  setData: (data: CachedSnsDto[]) => void;
  reset: () => void;
}

const initSnsAggreagatorStore = (): SnsAggregatorStore => {
  const { subscribe, set } = writable<SnsAggregatorData>({ data: undefined });

  return {
    subscribe,
    setData: (data) => set({ data }),
    reset: () => set({ data: undefined }),
  };
};

export const snsAggregatorStore = initSnsAggreagatorStore();
