import {ProposalRewardStatus, ProposalStatus, Topic} from '@dfinity/nns';

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
    status: [
        ProposalStatus.PROPOSAL_STATUS_OPEN,
        ProposalStatus.PROPOSAL_STATUS_REJECTED,
        ProposalStatus.PROPOSAL_STATUS_ACCEPTED,
        ProposalStatus.PROPOSAL_STATUS_EXECUTED,
    ],
}
