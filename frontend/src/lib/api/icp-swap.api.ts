import { ICP_SWAP_URL } from "$lib/constants/environment.constants";
import type { IcpSwapTicker } from "$lib/types/icp-swap";

export const queryIcpSwapTickers = async (): Promise<IcpSwapTicker[]> => {
  const url = new URL(ICP_SWAP_URL);
  url.pathname = "/tickers";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch ticker information from ICP Swap");
  }

  return response.json();
};
