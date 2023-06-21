import { queryCanisters } from "$lib/api/canisters.api";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { notForceCallStrategy } from "$lib/utils/env.utils";
import type { Identity } from "@dfinity/agent";
import { isNullish } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

export interface CanistersStoreData {
  canisters: CanisterInfo[] | undefined;
  certified: boolean | undefined;
}

export interface CanistersStore extends Readable<CanistersStoreData> {
  setCanisters(data: CanistersStoreData): void;
}

const stores: Record<string, CanistersStore> = {};

const loadCanistersFactory =
  (identity: Identity) => (set: (data: CanistersStoreData) => void) => {
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
        set({ canisters: [], certified: true });

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
export const initCanistersStore = (
  identity: Identity | undefined | null
): CanistersStore | undefined => {
  if (isNullish(identity)) {
    return;
  }
  const storeKey = identity.getPrincipal().toText();
  if (stores[storeKey]) {
    return stores[storeKey];
  }

  const { subscribe, set } = writable<CanistersStoreData>(
    {
      canisters: undefined,
      certified: undefined,
    },
    loadCanistersFactory(identity)
  );

  const store = {
    subscribe,

    setCanisters({ canisters, certified }: CanistersStoreData) {
      set({ canisters, certified });
    },
  };

  stores[storeKey] = store;

  return store;
};
