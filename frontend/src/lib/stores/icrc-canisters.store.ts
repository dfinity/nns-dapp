import type { UniverseCanisterIdText } from "$lib/types/universe";
import type { Principal } from "@dfinity/principal";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface IcrcCanisters {
  ledgerCansisterId: Principal;
  indexCanisterId: Principal;
}

export type IcrcCanistersStoreData = Record<
  UniverseCanisterIdText,
  IcrcCanisters
>;

export interface IcrcCanistersStore extends Readable<IcrcCanistersStoreData> {
  setCanisters: (data: IcrcCanisters) => void;
  reset: () => void;
}

/**
 * A store that holds the sets of ICRC compatible canisters.
 * The ledger canister id is used as the key and universe id.
 *
 * - setCanisters: set one set of canisters.
 * - reset: reset all information.
 *
 */
const initIcrcCanistersStore = (): IcrcCanistersStore => {
  const initialIcrcCanistersStoreData: IcrcCanistersStoreData = {};

  const { subscribe, update, set } = writable<IcrcCanistersStoreData>(
    initialIcrcCanistersStoreData
  );

  return {
    subscribe,

    setCanisters({ ledgerCansisterId, indexCanisterId }: IcrcCanisters) {
      update((state: IcrcCanistersStoreData) => ({
        ...state,
        [ledgerCansisterId.toText()]: {
          ledgerCansisterId,
          indexCanisterId,
        },
      }));
    },

    // Used in tests
    reset() {
      set(initialIcrcCanistersStoreData);
    },
  };
};

export const icrcCanistersStore = initIcrcCanistersStore();
