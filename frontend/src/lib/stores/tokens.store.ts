import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import { removeKeys } from "$lib/utils/utils";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface TokensStoreUniverseData {
  token: IcrcTokenMetadata;
  certified?: boolean;
}

export type TokensStoreData = Record<
  UniverseCanisterIdText,
  TokensStoreUniverseData
>;

export type TokensStoreSetTokenData = {
  canisterId: UniverseCanisterId;
} & TokensStoreUniverseData;

export interface TokensStore extends Readable<TokensStoreData> {
  setToken: (data: TokensStoreSetTokenData) => void;
  setTokens: (data: TokensStoreData) => void;
  reset: () => void;
  resetUniverse: (canisterId: UniverseCanisterId) => void;
}

/**
 * A store that holds the various token metadata (name, symbol, fee etc.).
 * Currently used to hold ckBTC and Snses metadata - i.e. Nns excluded.
 *
 * - setToken: set the token metadata fetched from an Icrc ledger
 * - reset: reset a particular ledger token metadata. used for testing purpose
 * - resetUniverse: reset the metadata from a particular ledger. useful in case of certification error as we remove data that are unproven
 *
 */
const initTokensStore = (): TokensStore => {
  const { subscribe, update, set } = writable<TokensStoreData>({});

  return {
    subscribe,

    setToken({ canisterId, certified, token }: TokensStoreSetTokenData) {
      update((state: TokensStoreData) => ({
        ...state,
        [canisterId.toText()]: {
          token,
          certified,
        },
      }));
    },

    setTokens(data: TokensStoreData) {
      update((state: TokensStoreData) => ({
        ...state,
        ...data,
      }));
    },

    // Used in tests
    reset() {
      set({});
    },

    resetUniverse(canisterId: UniverseCanisterId) {
      update((currentState: TokensStoreData) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [canisterId.toText()],
        })
      );
    },
  };
};

export const tokensStore = initTokensStore();
