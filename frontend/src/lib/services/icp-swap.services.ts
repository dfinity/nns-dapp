import { queryIcpSwapTickers } from "$lib/api/icp-swap.api";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";

export const loadIcpSwapTickers = async (): Promise<void> => {
  try {
    const tickers = await queryIcpSwapTickers();
    icpSwapTickersStore.set(tickers);
  } catch (error) {
    console.error(error);
  }
};
