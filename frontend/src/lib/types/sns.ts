import type { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsSwapBuyerState,
  SnsSwapDerivedState,
  SnsSwapInit,
  SnsSwapState,
} from "@dfinity/sns";

/**
 * Metadata are full optional in Candid files but mandatory currently in NNS-dapp
 */
export interface SnsSummaryMetadata {
  url: string;
  logo: string;
  name: string;
  description: string;
}

/**
 * Token metadata are to some extension optional and provided in Candid in a way the frontend cannot really use.
 * That's why we have to map the data as well.
 */
export interface SnsTokenMetadata {
  name: string;
  symbol: string;
}

export interface SnsSummarySwap {
  init: SnsSwapInit;
  state: SnsSwapState;
}

export interface SnsSummary {
  rootCanisterId: Principal;
  // Used to calculate the account for the participation.
  swapCanisterId: Principal;

  /**
   * The metadata of the Sns project (title, description, etc.)
   */
  metadata: SnsSummaryMetadata;

  /**
   * The token metadata of the Sns project (name of the token and symbol)
   */
  token: SnsTokenMetadata;

  /**
   * The initial information of the sale (min-max ICP etc.) and its current state (pending, open, committed etc.)
   */
  swap: SnsSummarySwap;
  /**
   * Derived information about the sale such as the current total of ICP all buyers have invested so far
   */
  derived: SnsSwapDerivedState;
}

export interface SnsSwapCommitment {
  rootCanisterId: Principal;
  myCommitment: SnsSwapBuyerState | undefined; // e8s
}
