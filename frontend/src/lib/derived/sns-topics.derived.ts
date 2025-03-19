import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { ListTopicsResponseWithUnknown } from "$lib/types/sns-aggregator";
import { convertDtoToListTopicsResponse } from "$lib/utils/sns-aggregator-converters.utils";
import { isNullish } from "@dfinity/utils";
import { type Readable } from "svelte/store";

export interface SnsParametersStore {
  [rootCanisterId: RootCanisterIdText]:
    | ListTopicsResponseWithUnknown
    | undefined;
}

/**
 * A store containing SNS topics for each project.
 * Returns undefined for projects where topics are not supported.
 */
export const snsTopicsStore: Readable<SnsParametersStore> =
  snsAggregatorDerived((sns) =>
    isNullish(sns?.topics)
      ? undefined
      : convertDtoToListTopicsResponse(sns.topics)
  );
