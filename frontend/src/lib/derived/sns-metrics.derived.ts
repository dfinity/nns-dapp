import { snsAggregatorDerived } from "$lib/derived/sns-aggregator.derived";
import { convertNervousSystemParameters } from "$lib/utils/sns-aggregator-converters.utils";
import type { SnsNervousSystemParameters } from "@dfinity/sns";
import { type Readable } from "svelte/store";

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
export const snsParametersStore: Readable<SnsParametersStore> =
  snsAggregatorDerived((sns) => ({
    parameters: convertNervousSystemParameters(sns.nervous_system_parameters),
  }));
