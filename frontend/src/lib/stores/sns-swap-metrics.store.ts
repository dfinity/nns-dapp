import type { RootCanisterIdText } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

/**
 * undefined - not initialized, null - not found
 */
export interface SnsSwapMetrics {
  saleBuyerCount: number;
}

export type SnsSwapMetricsStoreData = Record<
  RootCanisterIdText,
  SnsSwapMetrics | undefined | null
>;

export interface SnsSwapMetricsStore extends Readable<SnsSwapMetricsStoreData> {
  setMetrics: (data: {
    rootCanisterId: Principal;
    metrics: SnsSwapMetrics | undefined | null;
  }) => void;
  reset: () => void;
}

const initSnsSwapMetricsStore = (): SnsSwapMetricsStore => {
  const { subscribe, update, set } = writable<SnsSwapMetricsStoreData>({});

  return {
    subscribe,

    setMetrics({
      rootCanisterId,
      metrics,
    }: {
      rootCanisterId: Principal;
      metrics: SnsSwapMetrics | null | undefined;
    }) {
      update((currentState: SnsSwapMetricsStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: metrics,
      }));
    },

    // Used in tests
    reset() {
      set({});
    },
  };
};

export const snsSwapMetricsStore = initSnsSwapMetricsStore();
