import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import {
  hasValidStake,
  isCommunityFund,
  sortSnsNeuronsByCreatedTimestamp,
} from "$lib/utils/sns-neuron.utils";
import type { SnsNeuron } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";
import { snsProjectIdSelectedStore } from "./selected-project.derived";

export const sortedSnsNeuronStore: Readable<SnsNeuron[]> = derived(
  [snsNeuronsStore, snsProjectIdSelectedStore],
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
  [sortedSnsNeuronStore],
  ([sortedNeurons]) =>
    sortedNeurons.filter((neuron) => !isCommunityFund(neuron))
);

export const sortedSnsCFNeuronsStore: Readable<SnsNeuron[]> = derived(
  [sortedSnsNeuronStore],
  ([sortedNeurons]) => sortedNeurons.filter(isCommunityFund)
);
