import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { convertNervousSystemParameters } from "$lib/utils/sns-aggregator-converters.utils";
import type { SnsNervousSystemParameters } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";

export interface SnsParameters {
  parameters: SnsNervousSystemParameters;
}

export interface SnsParametersStore {
  // Root canister id is the key to identify the parameters for a specific project.
  [rootCanisterId: string]: SnsParameters;
}

/**
 * A store that contains the sns nervous system parameters for each project.
 */
export const snsParametersStore: Readable<SnsParametersStore> = derived(
  snsAggregatorStore,
  (aggregatorStore) =>
    Object.fromEntries(
      aggregatorStore.data?.map((sns) => {
        return [
          sns.canister_ids.root_canister_id,
          {
            parameters: convertNervousSystemParameters(
              sns.nervous_system_parameters
            ),
          },
        ];
      }) ?? []
    )
);
