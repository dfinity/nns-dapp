import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import { logWithTimestamp } from "$lib/utils/dev.utils";
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
}: {
  rootCanisterId: Principal;
  swapCanisterId: Principal;
}): Promise<void> => {
  const store = get(snsSwapMetricsStore);

  // skip update when data is available
  if (store[rootCanisterId.toText()] !== undefined) {
    return;
  }

  // mark in progress to avoid multiple load
  snsSwapMetricsStore.setMetrics({
    rootCanisterId,
    metrics: null,
  });

  const metrics = await querySnsMetrics({ swapCanisterId });
  snsSwapMetricsStore.setMetrics({
    rootCanisterId,
    metrics: metrics ?? null,
  });
};

const querySnsMetrics = async ({
  swapCanisterId,
}: {
  swapCanisterId: Principal;
}): Promise<{ saleBuyerCount: number } | undefined> => {
  logWithTimestamp("Loading SNS metrics...");

  try {
    // Test canister oc: const url = `https://${"2hx64-daaaa-aaaaq-aaana-cai"}.raw.ic0.app/metrics`;
    const url = `https://${swapCanisterId.toText()}.raw.ic0.app/metrics`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error loading SNS metrics");
    }

    const rawMetrics = await response.text();
    const saleBuyerCount = parseSnsSwapSaleBuyerCount(rawMetrics);
    return saleBuyerCount === undefined ? undefined : { saleBuyerCount };

    logWithTimestamp("Loading SNS metrics completed");
  } catch (err) {
    console.error("Error getting SNS metrics", err);
  }
};

// TODO(Maks): tests
/**
 * Exported for testing purposes
 *
 * @example text
 * ...
 * # TYPE sale_buyer_count gauge
 * sale_buyer_count 33 1677707139456
 * # HELP sale_cf_participants_count
 * ...
 */
export const parseSnsSwapSaleBuyerCount = (
  text: string
): number | undefined => {
  const value = Number(
    text
      .split("\n")
      ?.find((line) => line.startsWith("sale_buyer_count "))
      ?.split(/\s/)?.[1]
  );
  return isNaN(value) ? undefined : value;
};
