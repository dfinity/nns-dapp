import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { NNS_TOKEN } from "$lib/constants/tokens.constants";
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
 * It is currently initialized with the token metadata of the Nns / IC as constants. Further metadata - e.g. Sns and ckBTC - will be fetched and appended.
 *
 * - setToken: set the token metadata fetched from an Icrc ledger
 * - reset: reset a particular ledger token metadata. used for testing purpose
 * - resetUniverse: reset the metadata from a particular ledger. useful in case of certification error as we remove data that are unproven
 *
 */
const initTokensStore = (): TokensStore => {
  const initialTokensStoreData: TokensStoreData = {
    [OWN_CANISTER_ID_TEXT]: NNS_TOKEN,
  };

  const { subscribe, update, set } = writable<TokensStoreData>(
    initialTokensStoreData
  );

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
      set(initialTokensStoreData);
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
