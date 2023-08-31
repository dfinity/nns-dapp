import { isSnsFinalizing } from "$lib/utils/sns.utils";
import type { Principal } from "@dfinity/principal";
import type { SnsGetAutoFinalizationStatusResponse } from "@dfinity/sns";
import { isNullish, nonNullish } from "@dfinity/utils";
import { derived, writable, type Readable } from "svelte/store";

interface SnsFinalizationStatusData {
  data: SnsGetAutoFinalizationStatusResponse;
  certified: boolean;
}

export interface SnsFinalizationStatusStore
  extends Readable<SnsFinalizationStatusData> {
  setData: (data: SnsFinalizationStatusData) => void;
}

// Cache stores by root canister id.
const stores: Map<string, SnsFinalizationStatusStore> = new Map();

export const resetSnsFinalizationStatusStore = () => {
  stores.clear();
};

const initStore = (): SnsFinalizationStatusStore => {
  const { subscribe, set } = writable<SnsFinalizationStatusData>(undefined);

  const store = {
    subscribe,
    setData(params: SnsFinalizationStatusData) {
      set(params);
    },
  };

  return store;
};

export const getOrCreateSnsFinalizationStatusStore = (
  rootCanisterId: Principal
): SnsFinalizationStatusStore => {
  const store = stores.get(rootCanisterId.toText());

  if (nonNullish(store)) {
    return store;
  }

  const newStore = initStore();
  stores.set(rootCanisterId.toText(), newStore);

  return newStore;
};

export const createIsSnsFinalizingStore = (rootCanisterId: Principal) => {
  const store = getOrCreateSnsFinalizationStatusStore(rootCanisterId);

  return derived(store, (finalizationData) => {
    if (isNullish(finalizationData)) {
      return false;
    }

    return isSnsFinalizing(finalizationData.data);
  });
};
