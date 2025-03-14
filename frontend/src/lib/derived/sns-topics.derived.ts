import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import type { ListTopicsResponse } from "@dfinity/sns/dist/candid/sns_governance_test";
import { isNullish } from "@dfinity/utils";
import { type Readable } from "svelte/store";
import { convertDtoToListTopicsResponse } from "../utils/sns-aggregator-converters.utils";

export interface SnsParametersStore {
  [rootCanisterId: string]: ListTopicsResponse | undefined;
}

/**
 * A store that contains the sns nervous system topics for each project.
 */
export const snsTopicsStore: Readable<SnsParametersStore> =
  snsAggregatorDerived((sns) =>
    isNullish(sns?.topics)
      ? undefined
      : convertDtoToListTopicsResponse(sns.topics)
  );
