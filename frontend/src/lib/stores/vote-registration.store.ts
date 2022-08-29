import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { writable } from "svelte/store";

export type VoteRegistrationStatus =
  | undefined
  | "vote-registration"
  | "post-update"
  | "complete";

export interface VoteRegistration {
  status: VoteRegistrationStatus;
  proposalInfo: ProposalInfo;
  neuronIds: NeuronId[];
  successfullyVotedNeuronIds: NeuronId[];
  vote: Vote;
  toastId: symbol;
}

export interface VoteRegistrationStore {
  registrations: VoteRegistration[];
}

// TODO: think about having an abstract store for the basic CRUD

/**
 * A store that contain votes in progress data (proposals and neurons that were not confirmed by `update` calls)
 * Is used for optimistic UI update
 */
const initVoteRegistrationStore = () => {
  const { subscribe, update, set } = writable<VoteRegistrationStore>({
    registrations: [],
  });

  return {
    subscribe,

    create({
      vote,
      proposalInfo,
      neuronIds,
      toastId,
    }: {
      vote: Vote;
      proposalInfo: ProposalInfo;
      neuronIds: NeuronId[];
      toastId: symbol;
    }): VoteRegistration {
      const newEntry: VoteRegistration = {
        status: undefined,
        proposalInfo,
        neuronIds,
        successfullyVotedNeuronIds: [],
        vote,
        toastId,
      };

      update(({ registrations: votes }) => {
        if (votes.find(({ proposalInfo: { id } }) => id === proposalInfo.id)) {
          // Proposal `id` is used for the store entries indentification
          // Simultaneous voting for the same proposal is blocked by UI. But this is so critical that the throw was added. Otherwise potential errors would be extremely difficult to detect.
          throw new Error("Simultaneous proposal voting");
        }

        return {
          registrations: [...votes, newEntry],
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
      update(({ registrations: votes }) => {
        const item = votes.find(
          ({ proposalInfo: { id } }) => id === proposalId
        );

        if (item === undefined) {
          console.error("updating not voting item", votes, proposalId);
          return { registrations: votes };
        }

        return {
          registrations: [
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
      voteRegistration,
      status,
    }: {
      voteRegistration: VoteRegistration;
      status: VoteRegistrationStatus;
    }) {
      update(({ registrations: votes }) => ({
        registrations: votes.map((storeVote) =>
          storeVote.proposalInfo.id === voteRegistration.proposalInfo.id
            ? { ...storeVote, status }
            : storeVote
        ),
      }));
    },

    removeCompleted() {
      update(({ registrations: votes }) => ({
        registrations: votes.filter(({ status }) => status !== "complete"),
      }));
    },

    reset() {
      set({ registrations: [] });
    },
  };
};

export const voteRegistrationStore = initVoteRegistrationStore();
