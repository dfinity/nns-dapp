import type {
  NeuronId,
  NeuronInfo,
  ProposalId,
  ProposalInfo,
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
} from "@dfinity/nns";
import { derived, writable } from "svelte/store";
import { DEFAULT_PROPOSALS_FILTERS } from "../constants/proposals.constants";

export interface ProposalsFiltersStore {
  topics: Topic[];
  rewards: ProposalRewardStatus[];
  status: ProposalStatus[];
  excludeVotedProposals: boolean;
}

export interface NeuronSelectionStore {
  neurons: NeuronInfo[];
  selectedIds: NeuronId[];
}

/**
 * A store that contains the proposals
 *
 * - setProposals: replace the current list of proposals with a new list
 * - pushProposals: append proposals to the current list of proposals. Notably useful when the proposals are fetched in a page that implements an infinite scrolling.
 */
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

/**
 * A store that contains the filters that are used to fetch the proposals.
 *
 * The filters are handled in a specific store - i.e. not within the proposals store - because there is no clean way using svelte store to guess what has changed when a value is updated.
 * For example: if a store contains apples and bananas, when a change is applied and the subscribe functions hits, it is not possible to guess if there were new apples or bananas.
 *
 * In the "Proposals" page we have the need to query new proposals when filters changes i.e. trigger a search when the filter changes not when the proposals changes.
 * That's why above limitation leads to a separate store.
 *
 * - filterTopics: set the filter topics (enum Topic)
 * - filterRewards: set the filter for the status of the rewards (enum ProposalRewardStatus)
 * - filterStatus: set the filter for the status of the proposals (enum ProposalStatus)
 * - excludeVotedProposals: "Hide "Open" proposals where all your neurons have voted or are ineligible to vote"
 *
 */
const initProposalsFiltersStore = () => {
  const { subscribe, update, set } = writable<ProposalsFiltersStore>(
    DEFAULT_PROPOSALS_FILTERS
  );

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

    toggleExcludeVotedProposals() {
      update((filters: ProposalsFiltersStore) => ({
        ...filters,
        excludeVotedProposals: !filters.excludeVotedProposals,
      }));
    },

    reset() {
      set(DEFAULT_PROPOSALS_FILTERS);
    },
  };
};

/**
 * Contains proposalId of the proposalDetail page
 */
const initProposalIdStore = () => {
  const { subscribe, set } = writable<ProposalId | undefined>();

  return {
    subscribe,
    set,
    reset: () => set(undefined),
  };
};

/**
 * Contains proposalInfo of the proposalDetail page
 */
const initProposalInfoStore = () => {
  const proposal = writable<ProposalInfo | undefined>();
  const proposalChange = derived(
    [proposalIdStore, proposal],
    // reset proposal on proposalId change
    // TODO: add motivation
    ([$proposalIdStore, $proposal]) =>
      $proposal?.id === $proposalIdStore ? $proposal : undefined
  );

  return {
    set: proposal.set,
    ...proposalChange,
  };
};

/**
 * Contains available for voting neurons and their selection state
 */
const initNeuronSelectStore = () => {
  const { subscribe, update, set } = writable<NeuronSelectionStore>({
    neurons: [],
    selectedIds: [],
  });

  return {
    subscribe,

    set(neurons: NeuronInfo[]) {
      set({
        neurons: [...neurons],
        selectedIds: neurons.map(({ neuronId }) => neuronId),
      });
    },

    updateNeurons(neurons: NeuronInfo[]) {
      update(({ neurons: oldNeurons, selectedIds: oldSelectedIds }) => {
        const newIds = new Set(neurons.map(({ neuronId }) => neuronId));
        const oldIds = new Set(oldNeurons.map(({ neuronId }) => neuronId));
        const preservedSelection = oldSelectedIds.filter((id) =>
          newIds.has(id)
        );
        const newNeuronsSelection = Array.from(newIds).filter(
          (id) => oldIds.has(id) === false
        );
        const selectedIds = [...preservedSelection, ...newNeuronsSelection];
        return {
          neurons,
          selectedIds,
        };
      });
    },

    reset() {
      this.set([]);
    },

    toggleSelection(neuronId: NeuronId) {
      update(({ neurons, selectedIds }) => ({
        neurons,
        selectedIds: selectedIds.includes(neuronId)
          ? selectedIds.filter((id: NeuronId) => id !== neuronId)
          : Array.from(new Set([...selectedIds, neuronId])),
      }));
    },
  };
};

export const proposalsStore = initProposalsStore();
export const proposalsFiltersStore = initProposalsFiltersStore();
export const proposalIdStore = initProposalIdStore();
export const proposalInfoStore = initProposalInfoStore();
export const votingNeuronSelectStore = initNeuronSelectStore();
