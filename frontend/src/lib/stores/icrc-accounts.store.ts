import type { Account } from "$lib/types/account";
import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

interface IcrcAccounts {
  accounts: Account[];
  certified?: boolean;
}

// The key is the ledger canister ID as text.
// SNS accounts are included by SNS ledger canister ID.
type IcrcAccountStoreData = Record<string, IcrcAccounts>;

export interface IcrcAccountsStore extends Readable<IcrcAccountStoreData> {
  set: (params: {
    accounts: IcrcAccounts;
    ledgerCanisterId: Principal;
  }) => void;
  update: (params: {
    accounts: IcrcAccounts;
    ledgerCanisterId: Principal;
  }) => void;
  resetUniverse: (ledgerCanisterId: Principal) => void;
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
      ledgerCanisterId,
    }: {
      accounts: IcrcAccounts;
      ledgerCanisterId: Principal;
    }) => {
      update((currentState: IcrcAccountStoreData) => ({
        ...currentState,
        [ledgerCanisterId.toText()]: accounts,
      }));
    },

    update: ({
      accounts: { accounts, certified },
      ledgerCanisterId,
    }: {
      accounts: IcrcAccounts;
      ledgerCanisterId: Principal;
    }) => {
      update((currentState: IcrcAccountStoreData) => ({
        ...currentState,
        [ledgerCanisterId.toText()]: {
          accounts: [
            ...(currentState[ledgerCanisterId.toText()]?.accounts ?? []).filter(
              ({ identifier }) =>
                accounts.find(({ identifier: i }) => identifier === i) ===
                undefined
            ),
            ...accounts,
          ],
          certified,
        },
      }));
    },

    resetUniverse: (ledgerCanisterId: Principal) => {
      update((currentState: IcrcAccountStoreData) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [ledgerCanisterId.toText()],
        })
      );
    },

    reset: () => set(initialAccounts),
  };
};

export const icrcAccountsStore = initIcrcAccountsStore();
