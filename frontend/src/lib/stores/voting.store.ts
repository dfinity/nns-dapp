import type { NeuronId, ProposalId, Vote } from "@dfinity/nns";
import { writable } from "svelte/store";

export interface VoteInProgress {
  proposalId: ProposalId;
  neuronIds: NeuronId[];
  startVotingTimestamp: number;
  vote: Vote;
}

export interface VotingStore {
  votes: VoteInProgress[];
}

/**
 * A store that contain votes in progress data (proposals and neurons that were not confirmed by `update` calls)
 */
const initVoteInProgressStore = () => {
  const { subscribe, update } = writable<VotingStore>({
    votes: [],
  });

  return {
    subscribe,

    add(vote: VoteInProgress) {
      update(({ votes }) => {
        if (votes.find(({ proposalId }) => proposalId === vote.proposalId)) {
          throw new Error("Simultaneous proposal voting");
        }

        return {
          votes: [...votes, vote],
        };
      });
    },
    },

    remove(propsalId: ProposalId) {
      update(({ votes }) => ({
        votes: votes.filter(({ proposalId: id }) => id !== propsalId),
      }));
    },
  };
};

export const voteInProgressStore = initVoteInProgressStore();
