import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";

// TODO: suggest to move into the store and add typing
export const DEFAULT_PROPOSALS_FILTERS = {
  topics: [
    Topic.NetworkEconomics,
    Topic.Governance,
    Topic.NodeAdmin,
    Topic.ParticipantManagement,
    Topic.SubnetManagement,
    Topic.NetworkCanisterManagement,
    Topic.NodeProviderRewards,
  ],
  rewards: [
    ProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
    ProposalRewardStatus.PROPOSAL_REWARD_STATUS_READY_TO_SETTLE,
    ProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED,
    ProposalRewardStatus.PROPOSAL_REWARD_STATUS_INELIGIBLE,
  ],
  status: [ProposalStatus.PROPOSAL_STATUS_OPEN],
  excludeVotedProposals: false,
  lastAppliedFilter: undefined,
};

export type ProposalColor = "warning" | "success" | undefined;
export const PROPOSAL_COLOR: Record<ProposalStatus, ProposalColor> = {
  [ProposalStatus.PROPOSAL_STATUS_EXECUTED]: "success",
  [ProposalStatus.PROPOSAL_STATUS_OPEN]: "warning",
  [ProposalStatus.PROPOSAL_STATUS_UNKNOWN]: undefined,
  [ProposalStatus.PROPOSAL_STATUS_REJECTED]: undefined,
  [ProposalStatus.PROPOSAL_STATUS_ACCEPTED]: undefined,
  [ProposalStatus.PROPOSAL_STATUS_FAILED]: undefined,
};
