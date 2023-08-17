import type { Principal } from "@dfinity/principal";
import type { SnsGetDerivedStateResponse } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

interface SnsDerivedStateData {
  derivedState: SnsGetDerivedStateResponse;
  certified: boolean;
}

export interface SnsDerivedStateStore
  extends Readable<SnsDerivedStateData | undefined> {
  setDerivedState: (data: SnsDerivedStateData) => void;
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
const createSnsDerivedStateStore = (): SnsDerivedStateStore => {
  const { subscribe, set } = writable<SnsDerivedStateData | undefined>(
    undefined
  );

  return {
    subscribe,

    setDerivedState(data: SnsDerivedStateData) {
      set(data);
    },

    reset() {
      set(undefined);
    },
  };
};

export const getOrCreateDerivedStateStore = (
  rootCanisterId: Principal
): SnsDerivedStateStore => {
  const key = rootCanisterId.toText();
  const existingStore = stores.get(key);
  if (nonNullish(existingStore)) {
    return existingStore;
  }

  const newStore = createSnsDerivedStateStore();
  stores.set(key, newStore);
  return newStore;
};
