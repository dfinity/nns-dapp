import { queryIcpSwapTickers } from "$lib/api/icp-swap.api";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { get } from "svelte/store";

export const loadIcpSwapTickers = async (): Promise<void> => {
  if (get(icpSwapTickersStore) !== undefined) {
    // We keep the existing tickers for the duration of the session.
    return;
  }
  try {
    const tickers = await queryIcpSwapTickers();
    icpSwapTickersStore.set(tickers);
  } catch (error) {
    console.error(error);
  }
};
