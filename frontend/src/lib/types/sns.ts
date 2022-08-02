import type { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsSwapBuyerState, SnsSwapDerivedState,
  SnsSwapInit,
  SnsSwapState,
} from "@dfinity/sns";

export interface SnsSummarySwap {
  init: SnsSwapInit;
  state: SnsSwapState;
}

export interface SnsSummary {
  rootCanisterId: Principal;
  // Used to calculate the account for the participation.
  swapCanisterId: Principal;

  // TODO: to be replaced with real types for real data

  logo: string;
  name: string;
  symbol: string;
  url: string;

  tokenName: string;
  description: string;

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

// To differentiate SNS and NNS Neuron types, but for now, they have the same states.
export type SnsNeuronState = NeuronState;
