import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { writable } from "svelte/store";

export interface SnsNervousSystemFunctionsStore {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the nervous system functions.
  [rootCanisterId: string]: SnsNervousSystemFunction[];
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
      functions,
    }: {
      rootCanisterId: Principal;
      functions: SnsNervousSystemFunction[];
    }) {
      update((currentState: SnsNervousSystemFunctionsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: functions,
      }));
    },

    // Used for testing purposes
    reset() {
      set({});
    },
  };
};

export const snsFunctionsStore = initSnsFunctionsStore();
