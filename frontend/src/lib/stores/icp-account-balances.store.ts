import type { AccountIdentifierString } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { QueryAndUpdateStrategy } from "$lib/services/utils.services";
import { queuedStore } from "$lib/stores/queued-store";
import type { Readable } from "svelte/store";

export interface IcpAccountBalanceStoreData {
  balanceE8s: bigint;
  certified: boolean;
}

export type IcpAccountBalancesStoreData = Record<
  AccountIdentifierString,
  IcpAccountBalanceStoreData
>;

export interface SingleMutationIcpAccountBalancesStore {
  set: ({
    data,
    certified,
  }: {
    data: IcpAccountBalancesStoreData;
    certified: boolean;
  }) => void;
  setBalance: ({
    accountIdentifier,
    balanceE8s,
    certified,
  }: {
    accountIdentifier: string;
    balanceE8s: bigint;
    certified: boolean;
  }) => void;
  reset: ({ certified }: { certified: boolean }) => void;
  cancel: () => void;
}

export interface IcpAccountBalancesStore
  extends Readable<IcpAccountBalancesStoreData> {
  getSingleMutationIcpAccountBalancesStore: (
    strategy?: QueryAndUpdateStrategy | undefined
  ) => SingleMutationIcpAccountBalancesStore;
  resetForTesting: () => void;
  // Set the store contents if you don't care about the queryAndUpdate race
  // condition.
  setForTesting: (data: IcpAccountBalancesStoreData) => void;
}

const initIpcAccountBalancesStore = (): IcpAccountBalancesStore => {
  const initialStoreData = {};

  const { subscribe, getSingleMutationStore, resetForTesting } =
    queuedStore<IcpAccountBalancesStoreData>(initialStoreData);

  const getSingleMutationIcpAccountBalancesStore = (
    strategy?: QueryAndUpdateStrategy | undefined
  ): SingleMutationIcpAccountBalancesStore => {
    const { set, update, cancel } = getSingleMutationStore(strategy);

    return {
      set,

      setBalance({
        accountIdentifier,
        balanceE8s,
        certified,
      }: {
        accountIdentifier: string;
        balanceE8s: bigint;
        certified: boolean;
      }) {
        update({
          mutation: (storeData) => ({
            ...storeData,
            [accountIdentifier]: {
              balanceE8s,
              certified,
            },
          }),
          certified,
        });
      },
      reset: ({ certified }: { certified: boolean }) =>
        set({ data: initialStoreData, certified }),

      cancel,
    };
  };

  return {
    subscribe,
    getSingleMutationIcpAccountBalancesStore,
    resetForTesting,

    setForTesting(data: IcpAccountBalancesStoreData) {
      const mutableStore = getSingleMutationIcpAccountBalancesStore();
      mutableStore.set({ data, certified: true });
    },
  };
};

export const icpAccountBalancesStore = initIpcAccountBalancesStore();
