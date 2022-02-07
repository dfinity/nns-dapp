import type { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";

export type VotingFilters =
  | typeof Topic
  | typeof ProposalRewardStatus
  | typeof ProposalStatus;

export interface VotingFilterModalProps {
  labelKey: "topics" | "rewards" | "proposals";
  filters: VotingFilters;
}
