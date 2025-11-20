import type { CanisterIdString } from "@icp-sdk/canisters/nns";

export enum TickersProviders {
  ICP_SWAP = "ICPSwap",
  KONG_SWAP = "KongSwap",
}

export type ProviderLoader = () => Promise<TickersData>;
export enum ProviderErrors {
  NO_DATA = "NO_DATA",
  INVALID_ICP_PRICE = "INVALID_ICP_PRICE",
  INVALID_CKUSDC_PRICE = "INVALID_CKUSDC_PRICE",
}

export type TickersData = Record<CanisterIdString, number>;
export type TickersStoreData = TickersData | undefined | "error";
