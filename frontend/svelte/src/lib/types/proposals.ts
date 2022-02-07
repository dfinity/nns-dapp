import type { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";

export type ProposalsFilters =
  | typeof Topic
  | typeof ProposalRewardStatus
  | typeof ProposalStatus;

export interface ProposalsFilterModalProps {
  labelKey: "topics" | "rewards" | "proposals";
  filters: ProposalsFilters;
}
