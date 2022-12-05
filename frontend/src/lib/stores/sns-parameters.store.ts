import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
import { writable } from "svelte/store";

export interface SnsParameters {
  parameters: NervousSystemParameters;
  certified: boolean;
}

export interface SnsParametersStore {
  // Root canister id is the key to identify the parameters for a specific project.
  [rootCanisterId: string]: SnsParameters;
}

/**
 * A store that contains the sns nervous system parameters for each project.
 *
 * - setParameters: replace the current parameters for a specific sns project.
 * - reset: reset the store to an empty state.
 * - resetParameters: removed the parameters for a specific project.
 */
const initSnsParametersStore = () => {
  const { subscribe, update, set } = writable<SnsParametersStore>({});

  return {
    subscribe,

    setParameters({
      rootCanisterId,
      parameters,
      certified,
    }: {
      rootCanisterId: Principal;
      parameters: NervousSystemParameters;
      certified: boolean;
    }) {
      update((currentState: SnsParametersStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          parameters,
          certified,
        },
      }));
    },

    // Used in tests
    reset() {
      set({});
    },

    resetProject(rootCanisterId: Principal) {
      update((currentState: SnsParametersStore) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },
  };
};

export const snsParametersStore = initSnsParametersStore();
