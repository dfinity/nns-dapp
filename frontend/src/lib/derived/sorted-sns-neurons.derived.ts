import type { SnsNeuron } from "@dfinity/sns";
import { derived, type Readable } from "svelte/store";
import { snsNeuronsStore } from "../stores/sns-neurons.store";
import { sortSnsNeuronsByCreatedTimestamp } from "../utils/sns-neuron.utils";
import { snsProjectSelectedStore } from "./selected-project.derived";

export const sortedSnsNeuronStore: Readable<SnsNeuron[]> = derived(
  [snsNeuronsStore, snsProjectSelectedStore],
  ([store, selectedSnsRootCanisterId]) => {
    const projectStore = store[selectedSnsRootCanisterId.toText()];
    return projectStore === undefined
      ? []
      : sortSnsNeuronsByCreatedTimestamp(projectStore.neurons);
  }
);
