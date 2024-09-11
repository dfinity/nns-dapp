import type { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

interface SnsNervousSystemFunctions {
  nsFunctions: SnsNervousSystemFunction[];
  certified: boolean;
}
export interface SnsNervousSystemFunctionsData {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the nervous system functions.
  [rootCanisterId: string]: SnsNervousSystemFunctions;
}

interface SnsFunctionProject extends SnsNervousSystemFunctions {
  rootCanisterId: Principal;
}

export interface SnsNervousSystemFunctionsStore
  extends Readable<SnsNervousSystemFunctionsData> {
  setProjectsFunctions: (projects: SnsFunctionProject[]) => void;
  reset: () => void;
}

/**
 * A store that contains the nervous system functions for each sns project.
 *
 * - setProjectsFunctions: replace the list of functions for multiple projects at once.
 */
const initSnsFunctionsStore = (): SnsNervousSystemFunctionsStore => {
  const { subscribe, update, set } = writable<SnsNervousSystemFunctionsData>(
    {}
  );

  return {
    subscribe,

    setProjectsFunctions(wrappedFunctions: SnsFunctionProject[]) {
      update((currentState: SnsNervousSystemFunctionsData) =>
        wrappedFunctions.reduce(
          (acc, { rootCanisterId, nsFunctions, certified }) => ({
            ...acc,
            [rootCanisterId.toText()]: {
              certified,
              nsFunctions,
            },
          }),
          currentState
        )
      );
    },

    // Used for testing purposes
    reset() {
      set({});
    },
  };
};

// TODO: expose update only functions instead of a readable store
export const snsFunctionsStore = initSnsFunctionsStore();
