import type { CanisterIdString } from "@dfinity/nns";

export enum TickersProviders {
  ICP_SWAP = "icp-swap",
  KONG_SWAP = "kong-swap",
}

export const TICKERS_PROVIDER_NAMES: Record<TickersProviders, string> = {
  [TickersProviders.ICP_SWAP]: "ICPSwap",
  [TickersProviders.KONG_SWAP]: "KongSwap",
};

export type ProviderLoader = () => Promise<TickersData>;
export enum ProviderErrors {
  NO_DATA = "NO_DATA",
  INVALID_ICP_PRICE = "INVALID_ICP_PRICE",
  INVALID_CKUSDC_PRICE = "INVALID_CKUSDC_PRICE",
}

export type TickersData = Record<CanisterIdString, number>;
export type TickersStoreData = TickersData | undefined | "error";
