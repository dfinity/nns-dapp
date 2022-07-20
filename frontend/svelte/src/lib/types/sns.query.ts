import type { SnsSwap } from "@dfinity/sns";

export type QueryRootCanisterId = string;

export type QuerySnsSwapState = {
  rootCanisterId: QueryRootCanisterId;
  swap: [] | [SnsSwap];
};
