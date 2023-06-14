import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import { removeKeys } from "$lib/utils/utils";
import type { MinterInfo } from "@dfinity/ckbtc";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface CkBTCInfoStoreUniverseData {
  info: MinterInfo;
  certified?: boolean;
}

export type CkBTCInfoStoreData = Record<
  UniverseCanisterIdText,
  CkBTCInfoStoreUniverseData
>;

export type CkBTCInfoStoreSetTokenData = {
  canisterId: UniverseCanisterId;
} & CkBTCInfoStoreUniverseData;

export interface CkBTCInfoStore extends Readable<CkBTCInfoStoreData> {
  setInfo: (data: CkBTCInfoStoreSetTokenData) => void;
  reset: () => void;
  resetUniverse: (canisterId: UniverseCanisterId) => void;
}

/**
 * A store that holds the various information about ckBTC.
 *
 * - setInfo: set the information fetched from ckBTC minter
 * - reset: reset all information
 * - resetUniverse: reset the information for a particular universe
 *
 */
const initCkBTCInfoStore = (): CkBTCInfoStore => {
  const initialCkBTCInfoStoreData: CkBTCInfoStoreData = {};

  const { subscribe, update, set } = writable<CkBTCInfoStoreData>(
    initialCkBTCInfoStoreData
  );

  return {
    subscribe,

    setInfo({ canisterId, certified, info }: CkBTCInfoStoreSetTokenData) {
      update((state: CkBTCInfoStoreData) => ({
        ...state,
        [canisterId.toText()]: {
          info,
          certified,
        },
      }));
    },

    // Used in tests
    reset() {
      set(initialCkBTCInfoStoreData);
    },

    resetUniverse(canisterId: UniverseCanisterId) {
      update((currentState: CkBTCInfoStoreData) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [canisterId.toText()],
        })
      );
    },
  };
};

export const ckBTCInfoStore = initCkBTCInfoStore();
