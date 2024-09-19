import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { derived, type Readable } from "svelte/store";

/**
 * Creates a derived store, which maps root canister IDs to some data derived
 * from SNS aggregator data.
 */
export const snsAggregatorDerived = <T>(
  mapFn: (sns: CachedSnsDto) => T
): Readable<Record<string, T>> =>
  derived(snsAggregatorStore, (aggregatorStore) =>
    Object.fromEntries(
      aggregatorStore.data?.map((sns) => {
        return [sns.canister_ids.root_canister_id, mapFn(sns)];
      }) ?? []
    )
  );
