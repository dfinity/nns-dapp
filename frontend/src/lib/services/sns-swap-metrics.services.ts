import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { parseSnsSwapSaleBuyerCount } from "$lib/utils/sns.utils";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

// TODO(Maks): tests
/**
 * Get metrics from the store or fetch it
 * @param rootCanisterId
 */
export const loadSnsMetrics = async ({
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

  const metrics = await querySnsMetrics({ swapCanisterId });
  snsSwapMetricsStore.setMetrics({
    rootCanisterId,
    metrics: metrics ?? null,
  });
};

export const watchSnsMetrics = ({
  rootCanisterId,
  swapCanisterId,
}: {
  rootCanisterId: Principal;
  swapCanisterId: Principal;
}): (() => void) => {
  const interval = setInterval(() => {
    loadSnsMetrics({ rootCanisterId, swapCanisterId, forceFetch: true });
  }, WATCH_SALE_STATE_EVERY_MILLISECONDS);

  return () => {
    clearInterval(interval);
  };
};

const querySnsMetrics = async ({
  swapCanisterId,
}: {
  swapCanisterId: Principal;
}): Promise<{ saleBuyerCount: number } | undefined> => {
  logWithTimestamp("Loading SNS metrics...");

  try {
    // TODO: switch to a metrics canister. Otherwise not testable on testnet.
    const url = `https://${swapCanisterId.toText()}.raw.ic0.app/metrics`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("response not ok");
    }

    const rawMetrics = await response.text();
    const saleBuyerCount = parseSnsSwapSaleBuyerCount(rawMetrics);
    logWithTimestamp("Loading SNS metrics completed");
    return saleBuyerCount === undefined ? undefined : { saleBuyerCount };
  } catch (err) {
    logWithTimestamp("Error getting SNS metrics", err);
  }
};
