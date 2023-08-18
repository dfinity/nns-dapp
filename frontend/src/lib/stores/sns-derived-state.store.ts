import type { Principal } from "@dfinity/principal";
import type { SnsGetDerivedStateResponse } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

interface SnsDerivedStateProjectData {
  derivedState: SnsGetDerivedStateResponse;
  certified: boolean;
}

interface SnsDerivedStateData {
  [rootCanisterId: string]: SnsDerivedStateProjectData;
}

export interface SnsDerivedStateStore
  extends Readable<SnsDerivedStateData | undefined> {
  setDerivedState: (params: {
    data: SnsGetDerivedStateResponse;
    certified: boolean;
    rootCanisterId: Principal;
  }) => void;
  reset: () => void;
}

let stores: Map<string, SnsDerivedStateStore> = new Map();

export const resetDerivedStateStoresForTesting = () => {
  stores = new Map();
};

/**
 * A store that contains the derived state of a specific sns project.
 *
 * - setDerivedState: replace the current derived state with a new one.
 */
const initSnsDerivedStateStore = (): SnsDerivedStateStore => {
  const { subscribe, set, update } = writable<SnsDerivedStateData>({});

  return {
    subscribe,

    setDerivedState({
      data,
      certified,
      rootCanisterId,
    }: {
      data: SnsGetDerivedStateResponse;
      certified: boolean;
      rootCanisterId: Principal;
    }) {
      update((currentState: SnsDerivedStateData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          derivedState: data,
          certified,
        },
      }));
    },

    reset() {
      set({});
    },
  };
};

export const snsDerivedStateStore = initSnsDerivedStateStore();

export const getOrCreateDerivedStateStore = (
  rootCanisterId: Principal
): SnsDerivedStateStore => {
  const key = rootCanisterId.toText();
  const existingStore = stores.get(key);
  if (nonNullish(existingStore)) {
    return existingStore;
  }

  const newStore = initSnsDerivedStateStore();
  stores.set(key, newStore);
  return newStore;
};
