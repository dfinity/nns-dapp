import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import {
  hasValidStake,
  isCommunityFund,
  sortSnsNeuronsByStake,
} from "$lib/utils/sns-neuron.utils";
import type { SnsNeuron } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";

export const definedSnsNeuronStore: Readable<SnsNeuron[]> = derived(
  [snsNeuronsStore, selectedUniverseIdStore],
  ([store, selectedSnsRootCanisterId]) => {
    const projectStore = store[selectedSnsRootCanisterId.toText()];
    return projectStore === undefined
      ? []
      : projectStore.neurons.filter(hasValidStake);
  }
);

export const snsSortedNeuronStore: Readable<SnsNeuron[]> = derived(
  definedSnsNeuronStore,
  (store) => sortSnsNeuronsByStake(store)
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
