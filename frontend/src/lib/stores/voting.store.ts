import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { writable } from "svelte/store";

export type VotingStatus =
  | undefined
  | "vote-registration"
  | "post-update"
  | "complete";

export interface VoteInProgress {
  status: VotingStatus;
  proposalInfo: ProposalInfo;
  neuronIds: NeuronId[];
  successfullyVotedNeuronIds: NeuronId[];
  vote: Vote;
  toastId: symbol | undefined;
  updateProposalContext: (proposal: ProposalInfo) => void;
  // neuronRegistrationComplete: ({ neuronId }: { neuronId: NeuronId }) => void;
}

export interface VoteInProgressStore {
  votes: VoteInProgress[];
}

// TODO: think about having an abstract store for the basic CRUD

/**
 * A store that contain votes in progress data (proposals and neurons that were not confirmed by `update` calls)
 * Is used for optimistic UI update
 */
const initVoteInProgressStore = () => {
  const { subscribe, update, set } = writable<VoteInProgressStore>({
    votes: [],
  });

  return {
    subscribe,

    create({
      vote,
      proposalInfo,
      neuronIds,
      updateProposalContext,
      toastId,
    }: {
      vote: Vote;
      proposalInfo: ProposalInfo;
      neuronIds: NeuronId[];
      updateProposalContext: (proposal: ProposalInfo) => void;
      toastId: symbol;
    }): VoteInProgress {
      const newEntry: VoteInProgress = {
        status: undefined,
        proposalInfo,
        neuronIds,
        successfullyVotedNeuronIds: [],
        vote,
        toastId,
        updateProposalContext,
      };

      update(({ votes }) => {
        if (votes.find(({ proposalInfo: { id } }) => id === proposalInfo.id)) {
          // Proposal `id` is used for the store entries indentification
          // Simultaneous voting for the same proposal is blocked by UI. But this is so critical that the throw was added. Otherwise potential errors would be extremely difficult to detect.
          throw new Error("Simultaneous proposal voting");
        }

        return {
          votes: [...votes, newEntry],
        };
      });

      return newEntry;
    },

    addSuccessfullyVotedNeuronId({
      proposalId,
      neuronId,
    }: {
      proposalId: ProposalId;
      neuronId: NeuronId;
    }) {
      update(({ votes }) => {
        const item = votes.find(
          ({ proposalInfo: { id } }) => id === proposalId
        );

        if (item === undefined) {
          console.error("updating not voting item", votes, proposalId);
          return { votes };
        }

        return {
          votes: [
            ...votes.filter(({ proposalInfo: { id } }) => id !== proposalId),
            {
              ...item,
              successfullyVotedNeuronIds: Array.from(
                new Set([...item.successfullyVotedNeuronIds, neuronId])
              ),
            },
          ],
        };
      });
    },

    updateStatus({
      voteInProgress,
      status,
    }: {
      voteInProgress: VoteInProgress;
      status: VotingStatus;
    }) {
      update(({ votes }) => ({
        votes: votes.map((storeVote) =>
          storeVote.proposalInfo.id === voteInProgress.proposalInfo.id
            ? { ...storeVote, status }
            : storeVote
        ),
      }));
    },

    removeCompleted() {
      update(({ votes }) => ({
        votes: votes.filter(({ status }) => status !== "complete"),
      }));
    },

    reset() {
      set({ votes: [] });
    },
  };
};

export const voteInProgressStore = initVoteInProgressStore();
