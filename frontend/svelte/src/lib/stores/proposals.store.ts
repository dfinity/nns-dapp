import {
  ProposalInfo,
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
} from "@dfinity/nns";
import { writable } from "svelte/store";

export interface ProposalsStore {
  proposals: ProposalInfo[];
  filters: {
    topics: Topic[];
    rewards: ProposalRewardStatus[];
    status: ProposalStatus[];
  };
}

const initProposalsStore = () => {
  const { subscribe, update } = writable<ProposalsStore>({
    proposals: [],
    filters: {
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
    },
  });

  return {
    subscribe,

    pushProposals(proposals: ProposalInfo[]) {
      update(({ proposals: proposalInfos, filters }: ProposalsStore) => ({
        filters,
        proposals: [...proposalInfos, ...proposals],
      }));
    },

    filterTopics(topics: Topic[]) {
      update(({ proposals, filters }: ProposalsStore) => ({
        filters: {
          ...filters,
          topics,
        },
        proposals,
      }));
    },

    filterRewards(rewards: ProposalRewardStatus[]) {
      update(({ proposals, filters }: ProposalsStore) => ({
        filters: {
          ...filters,
          rewards,
        },
        proposals,
      }));
    },

    filterStatus(status: ProposalStatus[]) {
      update(({ proposals, filters }: ProposalsStore) => ({
        filters: {
          ...filters,
          status,
        },
        proposals,
      }));
    },
  };
};

export const proposalsStore = initProposalsStore();
