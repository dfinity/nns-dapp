import type { QueryAndUpdateStrategy } from "$lib/services/utils.services";
import type { Account } from "$lib/types/account";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";
import type { Readable } from "svelte/store";
import { queuedStore } from "./queued-store";

export interface AccountsStoreData {
  main?: Account;
  subAccounts?: Account[];
  hardwareWallets?: Account[];
  certified?: boolean;
}

export interface SingleMutationAccountsStore {
  set: (data: AccountsStoreData) => void;
  setBalance: ({
    certified,
    accountIdentifier,
    balanceE8s,
  }: {
    certified: boolean;
    accountIdentifier: string;
    balanceE8s: bigint;
  }) => void;
  reset: ({ certified }: { certified: boolean }) => void;
  cancel: () => void;
}

export interface AccountsStore extends Readable<AccountsStoreData> {
  // Returns a store on which operations can be performed for a single
  // mutation. Note that the changes applied for both the query and update
  // response count as a single mutation and should be applied using the same
  // store. The purpose of this store is to be able to associate the query and
  // update response of the same mutation.
  getSingleMutationAccountsStore: (
    strategy?: QueryAndUpdateStrategy | undefined
  ) => SingleMutationAccountsStore;
  resetForTesting: () => void;
  // Set the store contents if you don't care about the queryAndUpdate race
  // condition.
  setForTesting: (data: AccountsStoreData) => void;
}

/**
 * A store that contains the account information.
 */
const initAccountsStore = (): AccountsStore => {
  const initialAccounts: AccountsStoreData = {
    main: undefined,
    subAccounts: undefined,
    hardwareWallets: undefined,
    certified: undefined,
  };

  const { subscribe, getSingleMutationStore, resetForTesting } =
    queuedStore<AccountsStoreData>(initialAccounts);

  const getSingleMutationAccountsStore = (
    strategy?: QueryAndUpdateStrategy | undefined
  ): SingleMutationAccountsStore => {
    const { set, update, cancel } = getSingleMutationStore(strategy);

    return {
      set(accounts: AccountsStoreData) {
        set({ data: accounts, certified: accounts.certified || false });
      },

      setBalance({
        certified,
        accountIdentifier,
        balanceE8s,
      }: {
        certified: boolean;
        accountIdentifier: string;
        balanceE8s: bigint;
      }) {
        update({
          mutation: ({ main, subAccounts, hardwareWallets }) => {
            if (isNullish(main)) {
              // Ignore update if the main account is not set.
              return { main, subAccounts, hardwareWallets };
            }
            const newBalance = TokenAmount.fromE8s({
              amount: balanceE8s,
              token: ICPToken,
            });
            const mapNewBalance = (account: Account) => {
              return account.identifier === accountIdentifier
                ? { ...account, balance: newBalance }
                : account;
            };
            return {
              main: mapNewBalance(main),
              subAccounts: (subAccounts || []).map(mapNewBalance),
              hardwareWallets: (hardwareWallets || []).map(mapNewBalance),
            };
          },
          certified,
        });
      },

      reset: ({ certified }: { certified: boolean }) =>
        set({ data: initialAccounts, certified }),

      cancel,
    };
  };

  return {
    subscribe,
    getSingleMutationAccountsStore,
    resetForTesting,

    setForTesting(accounts: AccountsStoreData) {
      const mutableStore = getSingleMutationAccountsStore();
      mutableStore.set(accounts);
    },
  };
};

export const accountsStore = initAccountsStore();
