import { querySnsSwapMetrics } from "$lib/api/sns-swap-metrics.api";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { parseSnsSwapSaleBuyerCount } from "$lib/utils/sns.utils";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

/**
 * Get metrics from the store or fetch it
 * @param rootCanisterId
 */
export const loadSnsSwapMetrics = async ({
  rootCanisterId,
  swapCanisterId,
  forceFetch,
}: {
  rootCanisterId: Principal;
  swapCanisterId: Principal;
  forceFetch: boolean;
}): Promise<void> => {
  const store = get(snsSwapMetricsStore);

  // skip update when data is available
  if (!forceFetch && store[rootCanisterId.toText()] !== undefined) {
    return;
  }

  if (store[rootCanisterId.toText()] === undefined) {
    // mark in progress to avoid multiple load
    snsSwapMetricsStore.setMetrics({
      rootCanisterId,
      metrics: null,
    });
  }

  const rawMetrics = await querySnsSwapMetrics({ swapCanisterId });
  if (rawMetrics === undefined) {
    return;
  }

  const saleBuyerCount = parseSnsSwapSaleBuyerCount(rawMetrics);
  if (saleBuyerCount === undefined) {
    return;
  }

  snsSwapMetricsStore.setMetrics({
    rootCanisterId,
    metrics: { saleBuyerCount },
  });
};
