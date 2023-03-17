import type { RootCanisterIdText } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import { writable, type Readable } from "svelte/store";

interface ProjectTotalSupplyData {
  totalSupply: bigint;
  certified: boolean;
}

export type SnsTotalTokenSupplyStoreData = Record<
  RootCanisterIdText,
  ProjectTotalSupplyData
>;

interface SnsProjectTotalSupply extends ProjectTotalSupplyData {
  rootCanisterId: Principal;
}

export interface SnsTotalTokenSupplyStore
  extends Readable<SnsTotalTokenSupplyStoreData> {
  setTotalTokenSupplies: (projects: SnsProjectTotalSupply[]) => void;
  reset: () => void;
}

/**
 * A store that contains the total token supply of SNS projects.
 *
 * - setTotalTokenSupplies: set the total token supply of a list of projects
 * - reset: reset the store to its empty initial state
 */
const initSnsTotalTokenSupplyStore = (): SnsTotalTokenSupplyStore => {
  const store = writable<SnsTotalTokenSupplyStoreData>({});

  const { update, set } = store;

  return {
    ...store,

    setTotalTokenSupplies(supplies: SnsProjectTotalSupply[]) {
      update((currentState) =>
        supplies.reduce(
          (acc, { rootCanisterId, totalSupply, certified }) => ({
            ...acc,
            [rootCanisterId.toText()]: {
              totalSupply,
              certified,
            },
          }),
          currentState
        )
      );
    },

    // Used for testing
    reset() {
      set({});
    },
  };
};

export const snsTotalTokenSupplyStore = initSnsTotalTokenSupplyStore();
