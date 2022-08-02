import type { Principal } from "@dfinity/principal";
import type { SnsSwap, SnsSwapDerivedState } from "@dfinity/sns";
import type { SnsSummary } from "./sns";

export type QueryRootCanisterId = string;

// TODO: this type is temporary, ultimately it should be updated with the proper candid type that will be used to query the summary from the backend
export type QuerySnsSummary = Omit<
  SnsSummary,
  "swap" | "derived" | "swapCanisterId"
>;

export type QuerySnsSwapState = {
  rootCanisterId: QueryRootCanisterId;
  swapCanisterId: Principal;
  swap: [] | [SnsSwap];
  derived: [] | [SnsSwapDerivedState];
};
