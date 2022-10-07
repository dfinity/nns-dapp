import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { writable } from "svelte/store";

export interface ProjectNeuronStore {
  neurons: SnsNeuron[];
  // certified is an optimistic value - i.e. it represents the last value that has been pushed in store
  certified: boolean | undefined;
}
export interface NeuronsStore {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the neurons for a specific project.
  [rootCanisterId: string]: ProjectNeuronStore;
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

    resetProject(rootCanisterId: Principal) {
      update((currentState: NeuronsStore) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },
  };
};

export const snsNeuronsStore = initSnsNeuronsStore();
