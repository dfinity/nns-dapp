import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { derived, writable, type Readable } from "svelte/store";

/**
 * `undefined` means that the data is not loaded yet.
 */
export interface SnsAggregatorData {
  data: CachedSnsDto[] | undefined;
}

export interface SnsAggregatorStore extends Readable<SnsAggregatorData> {}

export interface SnsAggregatorIncludingAbortedProjectsStore
  extends SnsAggregatorStore {
  setData: (data: CachedSnsDto[]) => void;
  reset: () => void;
}

const initSnsAggreagatorStore =
  (): SnsAggregatorIncludingAbortedProjectsStore => {
    const { subscribe, set } = writable<SnsAggregatorData>({ data: undefined });

    return {
      subscribe,
      setData: (data) => set({ data }),
      reset: () => set({ data: undefined }),
    };
  };

export const snsAggregatorIncludingAbortedProjectsStore =
  initSnsAggreagatorStore();

export const snsAggregatorStore: SnsAggregatorStore = derived(
  snsAggregatorIncludingAbortedProjectsStore,
  (store) => {
    return {
      data: store.data?.filter(
        (sns) => sns.lifecycle.lifecycle !== SnsSwapLifecycle.Aborted
      ),
    };
  }
);
