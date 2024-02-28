import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { writable, type Readable } from "svelte/store";

export interface IcpAccountDetailsStoreData {
  accountDetails: AccountDetails;
  certified: boolean;
}

export interface IcpAccountDetailsStore
  extends Readable<IcpAccountDetailsStoreData | undefined> {
  set: (accountDetails: IcpAccountDetailsStoreData | undefined) => void;
  reset: () => void;
}

const initIpcAccountDetailsStore = (): IcpAccountDetailsStore => {
  const initialStoreData = undefined;
  const { subscribe, set } = writable<IcpAccountDetailsStoreData | undefined>(
    initialStoreData
  );

  return {
    subscribe,
    set,
    reset: () => set(initialStoreData),
  };
};

export const icpAccountDetailsStore = initIpcAccountDetailsStore();
