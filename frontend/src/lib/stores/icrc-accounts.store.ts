import type { Account } from "$lib/types/account";
import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

interface IcrcAccounts {
  accounts: Account[];
  certified?: boolean;
}

type IcrcAccountStoreData = Record<UniverseCanisterIdText, IcrcAccounts>;

export interface IcrcAccountsStore extends Readable<IcrcAccountStoreData> {
  set: (params: {
    accounts: IcrcAccounts;
    universeId: UniverseCanisterId;
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the ckBTC and other Icrc compatible accounts.
 */
const initIcrcAccountsStore = (): IcrcAccountsStore => {
  const initialAccounts: IcrcAccountStoreData = {};

  const { subscribe, update, set } =
    writable<IcrcAccountStoreData>(initialAccounts);

  return {
    subscribe,

    set: ({
      accounts,
      universeId,
    }: {
      accounts: IcrcAccounts;
      universeId: UniverseCanisterId;
    }) => {
      update((currentState: IcrcAccountStoreData) => ({
        ...currentState,
        [universeId.toText()]: accounts,
      }));
    },

    reset: () => set(initialAccounts),
  };
};

export const icrcAccountsStore = initIcrcAccountsStore();
