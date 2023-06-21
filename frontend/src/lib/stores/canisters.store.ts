import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
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

  const { subscribe, set } = writable<CanistersStoreData>({
    canisters: undefined,
    certified: undefined,
  });

  const store = {
    subscribe,

    setCanisters({ canisters, certified }: CanistersStoreData) {
      set({ canisters, certified });
    },
  };

  stores[storeKey] = store;

  return store;
};
