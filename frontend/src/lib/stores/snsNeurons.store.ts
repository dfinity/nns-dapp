import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { derived, writable, type Readable } from "svelte/store";
import { sortSnsNeuronsByCreatedTimestamp } from "../utils/sns-neuron.utils";
import { snsProjectSelectedStore } from "./projects.store";

export interface NeuronsStore {
  [rootCanisterId: string]: {
    neurons: SnsNeuron[];
    // certified is an optimistic value - i.e. it represents the last value that has been pushed in store
    certified: boolean | undefined;
  };
}

/**
 * A store that contains the sns neurons for each project.
 *
 * - setNeurons: replace the current list of neurons for a specific sns project with a new list
 */
const initSnsNeuronsStore = () => {
  const { subscribe, update, set } = writable<NeuronsStore>({});

  return {
    subscribe,

    setNeurons({
      rootCanisterId,
      neurons,
      certified,
    }: {
      rootCanisterId: Principal;
      neurons: SnsNeuron[];
      certified: boolean | undefined;
    }) {
      update((currentState: NeuronsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          neurons,
          certified,
        },
      }));
    },

    // Used in tests
    reset() {
      set({});
    },
  };
};

export const snsNeuronsStore = initSnsNeuronsStore();

export const sortedSnsNeuronStore: Readable<SnsNeuron[]> = derived(
  [snsNeuronsStore, snsProjectSelectedStore],
  ([store, selectedSnsRootCanisterId]) => {
    const projectStore = store[selectedSnsRootCanisterId.toText()];
    return projectStore === undefined
      ? []
      : sortSnsNeuronsByCreatedTimestamp(projectStore.neurons);
  }
);
