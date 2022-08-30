import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import { Color } from "../types/theme";

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
    ProposalRewardStatus.AcceptVotes,
    ProposalRewardStatus.ReadyToSettle,
    ProposalRewardStatus.Settled,
    ProposalRewardStatus.Ineligible,
  ],
  status: [ProposalStatus.Open],
  excludeVotedProposals: false,
  lastAppliedFilter: undefined,
};

export const PROPOSAL_COLOR: Record<ProposalStatus, Color | undefined> = {
  [ProposalStatus.Executed]: Color.SUCCESS,
  [ProposalStatus.Open]: Color.WARNING,
  [ProposalStatus.Unknown]: undefined,
  [ProposalStatus.Rejected]: undefined,
  [ProposalStatus.Accepted]: undefined,
  [ProposalStatus.Failed]: undefined,
};
