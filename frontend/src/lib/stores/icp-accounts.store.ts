import type { QueryAndUpdateStrategy } from "$lib/services/utils.services";
import type { IcpAccount } from "$lib/types/account";
import { isNullish } from "@dfinity/utils";
import type { Readable } from "svelte/store";
import { queuedStore } from "./queued-store";

export interface IcpAccountsStoreData {
  main?: IcpAccount;
  subAccounts?: IcpAccount[];
  hardwareWallets?: IcpAccount[];
  certified?: boolean;
}

export interface SingleMutationIcpAccountsStore {
  set: (data: IcpAccountsStoreData) => void;
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

export interface IcpAccountsStore extends Readable<IcpAccountsStoreData> {
  // Returns a store on which operations can be performed for a single
  // mutation. Note that the changes applied for both the query and update
  // response count as a single mutation and should be applied using the same
  // store. The purpose of this store is to be able to associate the query and
  // update response of the same mutation.
  getSingleMutationIcpAccountsStore: (
    strategy?: QueryAndUpdateStrategy | undefined
  ) => SingleMutationIcpAccountsStore;
  resetForTesting: () => void;
  // Set the store contents if you don't care about the queryAndUpdate race
  // condition.
  setForTesting: (data: IcpAccountsStoreData) => void;
}

/**
 * A store that contains the account information.
 */
const initIcpAccountsStore = (): IcpAccountsStore => {
  const initialAccounts: IcpAccountsStoreData = {
    main: undefined,
    subAccounts: undefined,
    hardwareWallets: undefined,
    certified: undefined,
  };

  const { subscribe, getSingleMutationStore, resetForTesting } =
    queuedStore<IcpAccountsStoreData>(initialAccounts);

  const getSingleMutationIcpAccountsStore = (
    strategy?: QueryAndUpdateStrategy | undefined
  ): SingleMutationIcpAccountsStore => {
    const { set, update, cancel } = getSingleMutationStore(strategy);

    return {
      set(accounts: IcpAccountsStoreData) {
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
            const mapNewBalance = (account: IcpAccount) => {
              return account.identifier === accountIdentifier
                ? { ...account, balanceE8s }
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
    getSingleMutationIcpAccountsStore,
    resetForTesting,

    setForTesting(accounts: IcpAccountsStoreData) {
      const mutableStore = getSingleMutationIcpAccountsStore();
      mutableStore.set(accounts);
    },
  };
};

export const icpAccountsStore = initIcpAccountsStore();
