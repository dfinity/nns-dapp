import type { NeuronId, ProposalId, Vote } from "@dfinity/nns";
import { writable } from "svelte/store";

export interface VoteInProgress {
  proposalId: ProposalId;
  neuronIds: NeuronId[];
  // TODO(create Jira task): use it in the upcomming message details
  successfullyVotedNeuronIds: NeuronId[];
  vote: Vote;
}

export interface VoteInProgressStore {
  votes: VoteInProgress[];
}

/**
 * A store that contain votes in progress data (proposals and neurons that were not confirmed by `update` calls)
 * Is used for optimistic UI update
 */
const initVoteInProgressStore = () => {
  const { subscribe, update } = writable<VoteInProgressStore>({
    votes: [],
  });

  return {
    subscribe,

    add(vote: VoteInProgress) {
      update(({ votes }) => {
        if (votes.find(({ proposalId }) => proposalId === vote.proposalId)) {
          // Simultaneous voting is blocked by UI. This check was added here only because otherwise this type of error would be extremely difficult to detect.
          throw new Error("Simultaneous proposal voting");
        }

        return {
          votes: [...votes, vote],
        };
      });
    },

    addSuccessfullyVotedNeuronIds({
      proposalId,
      successfullyVotedNeuronIds,
    }: {
      proposalId: ProposalId;
      successfullyVotedNeuronIds: NeuronId[];
    }) {
      update(({ votes }) => {
        const item = votes.find(({ proposalId: id }) => id === proposalId);

        if (item === undefined) {
          return { votes };
        }

        return {
          votes: [
            ...votes.filter(({ proposalId: id }) => id !== proposalId),
            {
              ...item,
              successfullyVotedNeuronIds: Array.from(
                new Set([
                  ...item.successfullyVotedNeuronIds,
                  ...successfullyVotedNeuronIds,
                ])
              ),
            },
          ],
        };
      });
    },

    remove(proposalId: ProposalId) {
      update(({ votes }) => ({
        votes: votes.filter(({ proposalId: id }) => id !== proposalId),
      }));
    },
  };
};

export const voteInProgressStore = initVoteInProgressStore();
