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
  reset: (certified: boolean) => void;
}

export interface AccountsStore extends Readable<AccountsStoreData> {
  // Returns a store on which operations can be performed for a single
  // mutation. Note that the changes applied for both the query and update
  // response count as a single mutation and should be applied using the same
  // store. The purpose of this store is to be able to associate the query and
  // update response of the same mutation.
  getSingleMutationStore: () => SingleMutationAccountsStore;
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

  const { subscribe, getSingleMutationStore } =
    queuedStore<AccountsStoreData>(initialAccounts);

  return {
    subscribe,

    getSingleMutationStore: () => {
      const { set, update } = getSingleMutationStore();

      return {
        set(accounts: AccountsStoreData) {
          set({ data: accounts, certified: accounts.certified });
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

        reset: (certified: boolean) =>
          set({ data: initialAccounts, certified }),
      };
    },
  };
};

export const accountsStore = initAccountsStore();
