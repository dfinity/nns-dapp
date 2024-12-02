import { queryIcpSwapTickers } from "$lib/api/icp-swap.api";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { nowInSeconds } from "$lib/utils/date.utils";

export const loadIcpSwapTickers = async (): Promise<void> => {
  try {
    const tickers = await queryIcpSwapTickers();
    icpSwapTickersStore.set({
      tickers,
      lastUpdateTimestampSeconds: nowInSeconds(),
    });
  } catch (error) {
    console.error(error);
  }
};
