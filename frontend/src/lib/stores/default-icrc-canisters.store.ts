import { browser } from "$app/environment";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface DefaultIcrcCanisters {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal;
}

export type DefaultIcrcCanistersStoreData = Record<
  UniverseCanisterIdText,
  DefaultIcrcCanisters
>;

export interface IcrcCanistersStore
  extends Readable<DefaultIcrcCanistersStoreData> {
  setCanisters: (data: DefaultIcrcCanisters) => void;
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
const initDefaultIcrcCanistersStore = (): IcrcCanistersStore => {
  const initialIcrcCanistersStoreData: DefaultIcrcCanistersStoreData = {};

  const { subscribe, update, set } = writable<DefaultIcrcCanistersStoreData>(
    initialIcrcCanistersStoreData
  );

  return {
    subscribe,

    setCanisters({ ledgerCanisterId, indexCanisterId }: DefaultIcrcCanisters) {
      update((state: DefaultIcrcCanistersStoreData) => ({
        ...state,
        [ledgerCanisterId.toText()]: {
          ledgerCanisterId,
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

export const defaultIcrcCanistersStore = initDefaultIcrcCanistersStore();

// Useful to help people record coins they accidentally sent to NNS dapp, but
// which are not officially supported by the NNS dapp.
//
// In the devtools console, run:
// __experimentalAddIcrc1Token(ledgerCanisterId, indexCanisterId)
if (browser) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  (
    window as unknown as {
      __experimentalAddIcrc1Token: (
        ledgerCanisterId: string,
        indexCanisterId: string
      ) => void;
    }
  ).__experimentalAddIcrc1Token = (
    ledgerCanisterId: string,
    indexCanisterId?: string
  ) => {
    defaultIcrcCanistersStore.setCanisters({
      ledgerCanisterId: Principal.fromText(ledgerCanisterId),
      indexCanisterId: nonNullish(indexCanisterId)
        ? Principal.fromText(indexCanisterId)
        : (undefined as unknown as Principal) /* use at your own risk */,
    });
  };
}
