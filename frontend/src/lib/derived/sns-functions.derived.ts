import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { convertNervousFunction } from "$lib/utils/sns-aggregator-converters.utils";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";

interface SnsNervousSystemFunctions {
  nsFunctions: SnsNervousSystemFunction[];
}
export interface SnsNervousSystemFunctionsData {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the nervous system functions.
  [rootCanisterId: string]: SnsNervousSystemFunctions;
}

export interface SnsNervousSystemFunctionsStore
  extends Readable<SnsNervousSystemFunctionsData> {}

/**
 * A store that contains the nervous system functions for each sns project.
 */
export const snsFunctionsStore: SnsNervousSystemFunctionsStore = derived(
  snsAggregatorStore,
  (aggregatorStore) =>
    Object.fromEntries(
      aggregatorStore.data?.map((sns) => [
        sns.canister_ids.root_canister_id,
        {
          nsFunctions: sns.parameters.functions.map(convertNervousFunction),
        },
      ]) ?? []
    )
);
