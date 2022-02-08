import {
  ProposalInfo,
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
} from "@dfinity/nns";
import { writable } from "svelte/store";

export interface ProposalsFiltersStore {
  topics: Topic[];
  rewards: ProposalRewardStatus[];
  status: ProposalStatus[];
}

const initProposalsStore = () => {
  const { subscribe, update, set } = writable<ProposalInfo[]>([]);

  return {
    subscribe,

    setProposals(proposals: ProposalInfo[]) {
      set([...proposals]);
    },

    pushProposals(proposals: ProposalInfo[]) {
      update((proposalInfos: ProposalInfo[]) => [
        ...proposalInfos,
        ...proposals,
      ]);
    },
  };
};

const initProposalsFiltersStore = () => {
  const { subscribe, update } = writable<ProposalsFiltersStore>({
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
  });

  return {
    subscribe,

    filterTopics(topics: Topic[]) {
      update((filters: ProposalsFiltersStore) => ({
        ...filters,
        topics,
      }));
    },

    filterRewards(rewards: ProposalRewardStatus[]) {
      update((filters: ProposalsFiltersStore) => ({
        ...filters,
        rewards,
      }));
    },

    filterStatus(status: ProposalStatus[]) {
      update((filters: ProposalsFiltersStore) => ({
        ...filters,
        status,
      }));
    },
  };
};

export const proposalsStore = initProposalsStore();
export const proposalsFiltersStore = initProposalsFiltersStore();
