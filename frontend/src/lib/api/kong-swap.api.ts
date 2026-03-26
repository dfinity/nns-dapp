import { KONG_SWAP_URL } from "$lib/constants/environment.constants";
import type { KongSwapTicker } from "$lib/types/kong-swap";

export const queryKongSwapTickers = async (): Promise<KongSwapTicker[]> => {
  if (!KONG_SWAP_URL) throw new Error("KongSwap URL is not configured");

  const url = new URL(KONG_SWAP_URL);
  url.pathname = "/api/coingecko/tickers";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch ticker information from KongSwap");
  }

  return response.json();
};
