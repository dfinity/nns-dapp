import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import {
  hasValidStake,
  isCommunityFund,
  sortSnsNeuronsByCreatedTimestamp,
} from "$lib/utils/sns-neuron.utils";
import type { SnsNeuron } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";
import { selectedUniverseIdStore } from "../selected-universe.derived";

export const snsSortedNeuronStore: Readable<SnsNeuron[]> = derived(
  [snsNeuronsStore, selectedUniverseIdStore],
  ([store, selectedSnsRootCanisterId]) => {
    const projectStore = store[selectedSnsRootCanisterId.toText()];
    return projectStore === undefined
      ? []
      : sortSnsNeuronsByCreatedTimestamp(
          projectStore.neurons.filter(hasValidStake)
        );
  }
);

export const sortedSnsUserNeuronsStore: Readable<SnsNeuron[]> = derived(
  [snsSortedNeuronStore],
  ([sortedNeurons]) =>
    sortedNeurons.filter((neuron) => !isCommunityFund(neuron))
);

export const sortedSnsCFNeuronsStore: Readable<SnsNeuron[]> = derived(
  [snsSortedNeuronStore],
  ([sortedNeurons]) => sortedNeurons.filter(isCommunityFund)
);
