import type { Principal } from "@dfinity/principal";
import type {
  SnsSwapBuyerState,
  SnsSwapInit,
  SnsSwapState,
} from "@dfinity/sns";

export interface SnsSummarySwap {
  init: SnsSwapInit;
  state: SnsSwapState;
}

export interface SnsSummary {
  rootCanisterId: Principal;

  // TODO: to be replaced with real types for real data

  logo: string;
  name: string;
  symbol: string;
  url: string;

  tokenName: string;
  description: string;

  swap: SnsSummarySwap;
}

export interface SnsSwapCommitment {
  rootCanisterId: Principal;
  myCommitment: SnsSwapBuyerState | undefined; // e8s
  currentCommitment: bigint; // e8s
}
