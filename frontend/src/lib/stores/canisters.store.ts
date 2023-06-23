import { queryCanisters } from "$lib/api/canisters.api";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { NOT_LOADED } from "$lib/constants/stores.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import type { StoreData } from "$lib/types/store";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import type { Identity } from "@dfinity/agent";
import { isNullish } from "@dfinity/utils";
import { derived, writable, type Readable } from "svelte/store";

export interface CanistersStoreData {
  canisters: CanisterInfo[] | undefined;
  certified: boolean | undefined;
}

type CanistersStored = StoreData<CanistersStoreData>;

export interface CanistersStore extends Readable<CanistersStored> {
  setCanisters(data: CanistersStoreData): void;
  setError(err: Error): void;
}

let stores: Record<string, CanistersStore> = {};

export const resetCanistersStoresCacheForTesting = () => {
  stores = {};
};

const loadCanistersFactory =
  (identity: Identity) => (set: (data: CanistersStored) => void) => {
    queryAndUpdate<CanisterInfo[], unknown>({
      request: (options) => queryCanisters(options),
      identity,
      strategy: FORCE_CALL_STRATEGY,
      onLoad: ({ response: canisters, certified }) =>
        set({ canisters, certified }),
      onError: ({ error: err, certified }) => {
        console.error(err);

        if (!certified && notForceCallStrategy()) {
          return;
        }

        // Explicitly handle only UPDATE errors
        set(err as Error);

        // TODO: Error and loading states
      },
      logMessage: "Syncing Canisters",
    });
  };

/**
 * A store that contains the canisters of the users
 *
 * - setCanisters: replace the current list of canisters with a new list (can be the effective list of canisters or empty)
 *
 * TODO: Error and loading states
 */
export const getOrCreateFullCanistersStore = (
  identity: Identity | undefined | null
): CanistersStore | undefined => {
  if (isNullish(identity)) {
    return;
  }
  const storeKey = identity.getPrincipal().toText();
  if (stores[storeKey]) {
    return stores[storeKey];
  }

  const { subscribe, set } = writable<CanistersStored>(
    NOT_LOADED,
    loadCanistersFactory(identity)
  );

  const store = {
    subscribe,

    setCanisters({ canisters, certified }: CanistersStoreData) {
      set({ canisters, certified });
    },

    setError(err: Error) {
      set(err);
    },
  };

  stores[storeKey] = store;

  return store;
};

const derivedStores: Record<
  string,
  Readable<CanistersStoreData | undefined>
> = {};

export const getOrCreateCanistersStore = (
  identity: Identity | undefined | null
): Readable<CanistersStoreData | undefined> | undefined => {
  if (isNullish(identity)) {
    return;
  }
  const storeKey = identity.getPrincipal().toText();
  if (derivedStores[storeKey]) {
    return derivedStores[storeKey];
  }

  const canistersStore = getOrCreateFullCanistersStore(identity);

  if (isNullish(canistersStore)) {
    return;
  }

  const derivedStore = derived(canistersStore, (storedData) => {
    if (storedData === NOT_LOADED || storedData instanceof Error) {
      return undefined;
    }
    return storedData;
  });

  derivedStores[storeKey] = derivedStore;

  return derivedStore;
};
