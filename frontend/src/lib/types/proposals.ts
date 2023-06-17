import type { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";

export type ProposalsFilters =
  | typeof Topic
  | typeof ProposalRewardStatus
  | typeof ProposalStatus;

export interface ProposalsFilterModalProps {
  category: "topics" | "rewards" | "status";
  filters: ProposalsFilters;
  selectedFilters: (Topic | ProposalRewardStatus | ProposalStatus)[];
}

export const PROPOSAL_FILTER_UNSPECIFIED_VALUE = 0;

export interface VotingNeuron {
  /** String version of nns or sns neuron id. To simplify its storage and comparison */
  neuronIdString: string;
  votingPower: bigint;
}
