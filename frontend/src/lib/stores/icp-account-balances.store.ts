import type { AccountIdentifierString } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { writable, type Readable } from "svelte/store";

export interface IcpAccountBalanceStoreData {
  balanceE8s: bigint;
  certified: boolean;
}

// The key is the ICP account identifier.
export type IcpAccountBalancesStoreData = Record<
  AccountIdentifierString,
  IcpAccountBalanceStoreData
>;

export interface IcpAccountBalancesStore
  extends Readable<IcpAccountBalancesStoreData> {
  setBalance: ({
    accountIdentifier,
    balanceE8s,
    certified,
  }: {
    accountIdentifier: string;
    balanceE8s: bigint;
    certified: boolean;
  }) => void;
  reset: () => void;
}

const initIpcAccountBalancesStore = (): IcpAccountBalancesStore => {
  const initialStoreData = {};
  const { subscribe, set, update } =
    writable<IcpAccountBalancesStoreData>(initialStoreData);

  return {
    subscribe,
    setBalance({
      accountIdentifier,
      balanceE8s,
      certified,
    }: {
      accountIdentifier: string;
      balanceE8s: bigint;
      certified: boolean;
    }) {
      update((storeData) => ({
        ...storeData,
        [accountIdentifier]: {
          balanceE8s,
          certified,
        },
      }));
    },
    reset: () => set(initialStoreData),
  };
};

export const icpAccountBalancesStore = initIpcAccountBalancesStore();
