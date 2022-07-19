import type { Principal } from "@dfinity/principal";
import type { Init, State } from "@dfinity/sns";

// TODO: to be replaced with real types

export interface SnsSummarySwap {
  details: Init;
  state: State;
}

export interface SnsSummary {
  rootCanisterId: Principal;

  logo: string;
  name: string;
  symbol: string;
  url: string;

  tokenName: string;
  description: string;

  swapDeadline: bigint; // seconds
  swapStart: bigint; // seconds
  minCommitment: bigint; // e8s
  maxCommitment: bigint; // e8s

  minParticipationCommitment: bigint; // e8s
  maxParticipationCommitment: bigint; // e8s

  swap: SnsSummarySwap;
}

export interface SnsSwapCommitment {
  rootCanisterId: Principal;
  myCommitment: bigint | undefined; // e8s
  currentCommitment: bigint; // e8s
}
