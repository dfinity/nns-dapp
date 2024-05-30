import type { ProposalStatus, Topic } from "@dfinity/nns";

export type ProposalsFilters = typeof Topic | typeof ProposalStatus;

export type UniversalProposalStatus =
  | "unknown"
  | "open"
  | "rejected"
  | "adopted"
  | "executed"
  | "failed";

export interface ProposalsFilterModalProps {
  category: "topics" | "status";
  filters: ProposalsFilters;
  selectedFilters: (Topic | ProposalStatus)[];
}

export const PROPOSAL_FILTER_UNSPECIFIED_VALUE = 0;

export interface VotingNeuron {
  /** String version of nns or sns neuron id. To simplify its storage and comparison */
  neuronIdString: string;
  votingPower: bigint;
}

// 100% -> 10000 basis points
export type BasisPoints = bigint;

// An entry for proposal navigation on the proposal detail page.
export interface ProposalsNavigationId {
  proposalId: string;
  universe: string;
}
