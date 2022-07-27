import type { SnsSwap } from "@dfinity/sns";
import type { SnsSummary } from "./sns";

export type QueryRootCanisterId = string;

// TODO: this type is temporary, ultimately it should be updated with the proper candid type that will be used to query the summary from the backend
export type QuerySnsSummary = Omit<SnsSummary, "swap">;

export type QuerySnsSwapState = {
  rootCanisterId: QueryRootCanisterId;
  swap: [] | [SnsSwap];
};
