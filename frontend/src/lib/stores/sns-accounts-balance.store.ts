import { removeKeys } from "$lib/utils/utils";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { writable, type Readable } from "svelte/store";

export type RootCanisterId = string;

interface SnsAccountsBalance {
  balance: TokenAmount | undefined;
  certified: boolean;
}

export type SnsAccountsBalanceWritableStore = Record<
  RootCanisterId,
  SnsAccountsBalance
>;

export interface SnsAccountsBalanceStore
  extends Readable<SnsAccountsBalanceWritableStore> {
  setBalance: (params: {
    rootCanisterId: Principal;
    balance: TokenAmount | undefined;
    certified: boolean;
  }) => void;
  resetProject: (rootCanisterId: Principal) => void;
}

const initSnsProjectsAccountsBalanceStore = (): SnsAccountsBalanceStore => {
  const { subscribe, update } = writable<SnsAccountsBalanceWritableStore>({});

  return {
    subscribe,

    setBalance({
      rootCanisterId,
      balance,
      certified,
    }: {
      rootCanisterId: Principal;
      balance: TokenAmount | undefined;
      certified: boolean;
    }) {
      update((currentState: SnsAccountsBalanceWritableStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          balance,
          certified,
        },
      }));
    },

    resetProject(rootCanisterId: Principal) {
      update((currentState: SnsAccountsBalanceWritableStore) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },
  };
};

export const snsAccountsBalanceStore = initSnsProjectsAccountsBalanceStore();
