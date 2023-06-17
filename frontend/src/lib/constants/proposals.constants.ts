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
    Topic.SnsAndCommunityFund,
  ],
  rewards: [
    ProposalRewardStatus.AcceptVotes,
    ProposalRewardStatus.ReadyToSettle,
    ProposalRewardStatus.Settled,
    ProposalRewardStatus.Ineligible,
  ],
  status: [ProposalStatus.Open],
  excludeVotedProposals: false,
  lastAppliedFilter: undefined,
};

export enum ProposalStatusColor {
  PRIMARY = "primary",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export const PROPOSAL_COLOR: Record<
  ProposalStatus,
  ProposalStatusColor | undefined
> = {
  [ProposalStatus.Executed]: ProposalStatusColor.SUCCESS,
  [ProposalStatus.Open]: ProposalStatusColor.WARNING,
  [ProposalStatus.Unknown]: undefined,
  [ProposalStatus.Rejected]: ProposalStatusColor.ERROR,
  [ProposalStatus.Accepted]: undefined,
  [ProposalStatus.Failed]: ProposalStatusColor.ERROR,
};

export const DEPRECATED_TOPICS = [Topic.SnsDecentralizationSale];
