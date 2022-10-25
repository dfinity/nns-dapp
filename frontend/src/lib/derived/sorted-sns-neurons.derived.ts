import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import {
  hasValidStake,
  sortSnsNeuronsByCreatedTimestamp,
} from "$lib/utils/sns-neuron.utils";
import type { SnsNeuron } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";
import { snsProjectSelectedStore } from "./selected-project.derived";

export const sortedSnsNeuronStore: Readable<SnsNeuron[]> = derived(
  [snsNeuronsStore, snsProjectSelectedStore],
  ([store, selectedSnsRootCanisterId]) => {
    const projectStore = store[selectedSnsRootCanisterId.toText()];
    return projectStore === undefined
      ? []
      : sortSnsNeuronsByCreatedTimestamp(
          projectStore.neurons.filter(hasValidStake)
        );
  }
);
