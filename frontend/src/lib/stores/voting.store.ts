import type { NeuronId, ProposalId, Vote } from "@dfinity/nns";
import { writable } from "svelte/store";
import { sameObjects } from "../utils/utils";

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
      update(({ votes }) => ({
        votes: [...votes, vote],
      }));
    },

    remove(vote: VoteInProgress) {
      update(({ votes }) => ({
        votes: votes.filter((v) => !sameObjects(v, vote)),
      }));
    },
  };
};

export const voteInProgressStore = initVoteInProgressStore();
