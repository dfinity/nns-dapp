import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import type { CachedListTopicsResponseDto } from "$lib/types/sns-aggregator";
import { type Readable } from "svelte/store";

export interface SnsParametersStore {
  [rootCanisterId: string]: CachedListTopicsResponseDto;
}

/**
 * A store that contains the sns nervous system topics for each project.
 */
export const snsTopicsStore: Readable<SnsParametersStore> =
  snsAggregatorDerived((sns) => sns.topics);
