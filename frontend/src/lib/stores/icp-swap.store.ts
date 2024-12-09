import type { IcpSwapTicker } from "$lib/types/icp-swap";
import { writable, type Readable } from "svelte/store";

export type IcpSwapTickersStoreData = IcpSwapTicker[] | undefined | "error";

export interface IcpSwapTickersStore extends Readable<IcpSwapTickersStoreData> {
  set: (data: IcpSwapTickersStoreData) => void;
}

const initIcpSwapTickersStore = (): IcpSwapTickersStore => {
  const { subscribe, set } = writable<IcpSwapTickersStoreData>(undefined);

  return {
    subscribe,
    set,
  };
};

export const icpSwapTickersStore = initIcpSwapTickersStore();
