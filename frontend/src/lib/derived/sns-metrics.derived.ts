import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import type { MetricsDto } from "$lib/types/sns-aggregator";
import { isNullish } from "@dfinity/utils";
import { type Readable } from "svelte/store";

export interface SnsMetricsStoreData {
  // Root canister id is the key to identify the metrics for a specific project.
  [rootCanisterId: string]: MetricsDto | undefined;
}

/**
 * A store that contains the sns metrics for each project.
 */
export const snsMetricsStore: Readable<SnsMetricsStoreData> =
  snsAggregatorDerived((sns) =>
    isNullish(sns.metrics?.get_metrics_result?.Ok)
      ? undefined
      : sns.metrics?.get_metrics_result?.Ok
  );
