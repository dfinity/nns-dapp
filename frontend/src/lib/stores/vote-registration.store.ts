import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export type VoteRegistrationStatus =
  | "vote-registration"
  | "post-update"
  | "complete";

export interface VoteRegistration {
  status: VoteRegistrationStatus;
  proposalInfo: ProposalInfo;
  neuronIds: NeuronId[];
  successfullyVotedNeuronIds: NeuronId[];
  vote: Vote;
}

export interface VoteRegistrationStoreData {
  registrations: VoteRegistration[];
}

export interface VoteRegistrationStore
  extends Readable<VoteRegistrationStoreData> {
  add: (params: {
    vote: Vote;
    proposalInfo: ProposalInfo;
    neuronIds: NeuronId[];
  }) => VoteRegistration;
  addSuccessfullyVotedNeuronId: (params: {
    proposalId: ProposalId;
    neuronId: NeuronId;
  }) => void;
  updateStatus: (params: {
    proposalId: ProposalId;
    status: VoteRegistrationStatus;
  }) => void;
  remove: (proposalId: ProposalId) => void;
  reset: () => void;
}

// TODO: think about having an abstract store for the basic CRUD

/**
 * A store that contain votes in progress data (proposals and neurons that were not confirmed by `update` calls)
 * Is used for optimistic UI update
 */
const initVoteRegistrationStore = (): VoteRegistrationStore => {
  const { subscribe, update, set } = writable<VoteRegistrationStoreData>({
    registrations: [],
  });

  return {
    subscribe,

    add({
      vote,
      proposalInfo,
      neuronIds,
    }: {
      vote: Vote;
      proposalInfo: ProposalInfo;
      neuronIds: NeuronId[];
    }): VoteRegistration {
      const newEntry: VoteRegistration = {
        status: "vote-registration",
        proposalInfo,
        neuronIds,
        successfullyVotedNeuronIds: [],
        vote,
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
      proposalId,
      status,
    }: {
      proposalId: ProposalId;
      status: VoteRegistrationStatus;
    }) {
      update(({ registrations: votes }) => ({
        registrations: votes.map((storeVote) =>
          storeVote.proposalInfo.id === proposalId
            ? { ...storeVote, status }
            : storeVote
        ),
      }));
    },

    remove(proposalId: ProposalId) {
      update(({ registrations: votes }) => ({
        registrations: votes.filter(
          ({ proposalInfo: { id } }) => id !== proposalId
        ),
      }));
    },

    reset() {
      set({ registrations: [] });
    },
  };
};

export const voteRegistrationStore = initVoteRegistrationStore();
