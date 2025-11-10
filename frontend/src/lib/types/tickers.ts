import type { CanisterIdString } from "@dfinity/nns";

export type TickersProviders = "icp-swap";
export type ProviderLoader = () => Promise<TickersData>;

export type TickersData = Record<CanisterIdString, number>;

export type TickersStoreData = TickersData | undefined | "error";
