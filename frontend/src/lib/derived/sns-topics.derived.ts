import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import type { ListTopicsResponseWithUnknown } from "$lib/types/sns-aggregator";
import { convertDtoToListTopicsResponse } from "$lib/utils/sns-aggregator-converters.utils";
import { isNullish } from "@dfinity/utils";
import { type Readable } from "svelte/store";

export interface SnsParametersStore {
  [rootCanisterId: string]: ListTopicsResponseWithUnknown | undefined;
}

/**
 * A store that contains the sns nervous system topics for each project.
 * Contains undefined if the topics are not set (outdated sns).
 */
export const snsTopicsStore: Readable<SnsParametersStore> =
  snsAggregatorDerived((sns) =>
    isNullish(sns?.topics)
      ? undefined
      : convertDtoToListTopicsResponse(sns.topics)
  );
