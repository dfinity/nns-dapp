import type { Principal } from "@dfinity/principal";
import type { SnsGetLifecycleResponse } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

interface SnsLifecycleData {
  data: SnsGetLifecycleResponse;
  certified: boolean;
}

export interface SnsLifecycleStore
  extends Readable<SnsLifecycleData | undefined> {
  setData: (data: SnsLifecycleData) => void;
  reset: () => void;
}

let stores: Map<string, SnsLifecycleStore> = new Map();

export const resetLiefcycleStoresForTesting = () => {
  stores = new Map();
};

/**
 * A store that contains the lifecycle of a specific sns project.
 *
 * - setData: replace the current lifecycle with a new one.
 */
const createSnsLifecycleStore = (): SnsLifecycleStore => {
  const { subscribe, set } = writable<SnsLifecycleData | undefined>(undefined);

  return {
    subscribe,

    setData(data: SnsLifecycleData) {
      set(data);
    },

    reset() {
      set(undefined);
    },
  };
};

export const getOrCreateLifecycleStore = (
  rootCanisterId: Principal
): SnsLifecycleStore => {
  const key = rootCanisterId.toText();
  const existingStore = stores.get(key);
  if (nonNullish(existingStore)) {
    return existingStore;
  }

  const newStore = createSnsLifecycleStore();
  stores.set(key, newStore);
  return newStore;
};
