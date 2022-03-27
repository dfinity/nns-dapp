import type {
  NeuronId,
  NeuronInfo,
  ProposalId,
  ProposalInfo,
} from "@dfinity/nns";
import { derived, writable } from "svelte/store";

export interface NeuronSelectionStore {
  neurons: NeuronInfo[];
  selectedIds: NeuronId[];
}

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

export const proposalIdStore = initProposalIdStore();
export const proposalInfoStore = initProposalInfoStore();
export const votingNeuronSelectStore = initNeuronSelectStore();
