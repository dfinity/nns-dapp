import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { writable } from "svelte/store";

export interface SnsNervousSystemFunctionsStore {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the nervous system functions.
  [rootCanisterId: string]: {
    nsFunctions: SnsNervousSystemFunction[];
    certified: boolean;
  };
}

/**
 * A store that contains the nervous system functions for each sns project.
 *
 * - setFunctions: replace the current list of functions for a specific sns project with a new list
 */
const initSnsFunctionsStore = () => {
  const { subscribe, update, set } = writable<SnsNervousSystemFunctionsStore>(
    {}
  );

  return {
    subscribe,

    setFunctions({
      rootCanisterId,
      nsFunctions,
      certified,
    }: {
      rootCanisterId: Principal;
      nsFunctions: SnsNervousSystemFunction[];
      certified: boolean;
    }) {
      update((currentState: SnsNervousSystemFunctionsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          certified,
          nsFunctions,
        },
      }));
    },

    // Used for testing purposes
    reset() {
      set({});
    },
  };
};

export const snsFunctionsStore = initSnsFunctionsStore();
