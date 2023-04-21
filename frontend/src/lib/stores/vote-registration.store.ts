import type { VotingNeuron } from "$lib/types/proposals";
import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import { preserveNeuronSelectionAfterUpdate } from "$lib/utils/proposals.utils";
import type { Vote } from "@dfinity/nns";
import type { SnsVote } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

export type VoteRegistrationStatus =
  | "vote-registration"
  | "post-update"
  | "complete";

export interface VoteRegistrationStoreEntry {
  status: VoteRegistrationStatus;
  /** Text version of nns or sns proposal id. */
  proposalIdString: string;
  neuronIdStrings: string[];
  successfullyVotedNeuronIdStrings: string[];
  vote: Vote | SnsVote;
}

export type VoteRegistrationStoreMap = Record<
  UniverseCanisterIdText,
  VoteRegistrationStoreEntry[]
>;

export interface VoteRegistrationStoreData {
  registrations: VoteRegistrationStoreMap;
}

export type VoteRegistrationStoreAddData = {
  canisterId: UniverseCanisterId;
} & Omit<
  VoteRegistrationStoreEntry,
  "status" | "successfullyVotedNeuronIdStrings"
>;

export type VoteRegistrationStoreAddSuccessfullyVotedNeuronIdData = {
  proposalIdString: string;
  neuronIdString: string;
  canisterId: UniverseCanisterId;
};

export type VoteRegistrationStoreUpdateStatusData = {
  proposalIdString: string;
  status: VoteRegistrationStatus;
  canisterId: UniverseCanisterId;
};

export type VoteRegistrationStoreRemoveData = {
  proposalIdString: string;
  canisterId: UniverseCanisterId;
};

export interface VoteRegistrationStore
  extends Readable<VoteRegistrationStoreData> {
  add: (data: VoteRegistrationStoreAddData) => void;
  addSuccessfullyVotedNeuronId: (
    data: VoteRegistrationStoreAddSuccessfullyVotedNeuronIdData
  ) => void;
  updateStatus: (data: VoteRegistrationStoreUpdateStatusData) => void;
  remove: (data: VoteRegistrationStoreRemoveData) => void;
  reset: () => void;
}

export interface NeuronSelectionStore {
  neurons: VotingNeuron[];
  // TODO: selectedNeurons OR selectedIdStrings
  selectedIds: string[];
}

/**
 * A store that contain votes in progress data (proposals and neurons that were not confirmed by `update` calls)
 * Is used for optimistic UI update
 */
const initVoteRegistrationStore = (): VoteRegistrationStore => {
  const { subscribe, update, set } = writable<VoteRegistrationStoreData>({
    registrations: {},
  });

  return {
    subscribe,

    add({
      vote,
      proposalIdString,
      neuronIdStrings,
      canisterId,
    }: VoteRegistrationStoreAddData): void {
      const newEntry: VoteRegistrationStoreEntry = {
        status: "vote-registration",
        proposalIdString: proposalIdString,
        neuronIdStrings,
        successfullyVotedNeuronIdStrings: [],
        vote,
      };

      update(({ registrations }): VoteRegistrationStoreData => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          return {
            registrations: {
              ...registrations,
              [canisterId.toText()]: [newEntry],
            },
          };
        }

        if (
          universeRegistrations.find(
            ({ proposalIdString: id }) => id === proposalIdString
          )
        ) {
          // Proposal `id` is used for the store entries indentification
          // Simultaneous voting for the same proposal is blocked by UI. But this is so critical that the throw was added. Otherwise potential errors would be extremely difficult to detect.
          throw new Error("Simultaneous proposal voting");
        }

        return {
          registrations: {
            ...registrations,
            [canisterId.toText()]: [...universeRegistrations, newEntry],
          },
        };
      });
    },

    addSuccessfullyVotedNeuronId({
      proposalIdString,
      neuronIdString,
      canisterId,
    }: VoteRegistrationStoreAddSuccessfullyVotedNeuronIdData) {
      update(({ registrations }) => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          throw new Error("No registrations for canister id");
        }

        const proposalRegistration = universeRegistrations.find(
          ({ proposalIdString: id }) => id === proposalIdString
        );

        if (proposalRegistration === undefined) {
          console.error(
            "updating not voting item",
            canisterId.toText(),
            proposalIdString
          );
          return { registrations };
        }

        return {
          registrations: {
            ...registrations,
            [canisterId.toText()]: [
              ...universeRegistrations.filter(
                ({ proposalIdString: id }) => id !== proposalIdString
              ),
              {
                ...proposalRegistration,
                // store only unique ids
                successfullyVotedNeuronIdStrings: Array.from(
                  new Set([
                    ...proposalRegistration.successfullyVotedNeuronIdStrings,
                    neuronIdString,
                  ])
                ),
              },
            ],
          },
        };
      });
    },

    updateStatus({
      proposalIdString,
      status,
      canisterId,
    }: VoteRegistrationStoreUpdateStatusData) {
      update(({ registrations }) => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          throw new Error("no registrations for canister ID");
        }

        const proposalRegistration = universeRegistrations.find(
          ({ proposalIdString: id }) => id === proposalIdString
        );

        if (proposalRegistration === undefined) {
          console.error(
            "Updating not voting item",
            canisterId.toText(),
            proposalIdString
          );
          return { registrations };
        }

        return {
          registrations: {
            ...registrations,
            [canisterId.toText()]: [
              ...universeRegistrations.filter(
                ({ proposalIdString: id }) => id !== proposalIdString
              ),
              {
                ...proposalRegistration,
                status,
              },
            ],
          },
        };
      });
    },

    remove({ proposalIdString, canisterId }: VoteRegistrationStoreRemoveData) {
      update(({ registrations }) => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          throw new Error("no registrations for canister id");
        }

        return {
          registrations: {
            ...registrations,
            [canisterId.toText()]: [
              ...universeRegistrations.filter(
                ({ proposalIdString: id }) => id !== proposalIdString
              ),
            ],
          },
        };
      });
    },

    reset() {
      set({ registrations: {} });
    },
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

    set(neurons: VotingNeuron[]) {
      set({
        neurons: [...neurons],
        selectedIds: neurons.map(({ neuronIdString }) => neuronIdString),
      });
    },

    updateNeurons(neurons: VotingNeuron[]) {
      update(({ neurons: currentNeurons, selectedIds }) => {
        return {
          neurons,
          selectedIds: preserveNeuronSelectionAfterUpdate({
            neurons: currentNeurons,
            updatedNeurons: neurons,
            selectedIds,
          }),
        };
      });
    },

    // Used for testing purpose
    reset() {
      this.set([]);
    },

    toggleSelection(neuronId: string) {
      update(({ neurons, selectedIds }) => ({
        neurons,
        selectedIds: selectedIds.includes(neuronId)
          ? selectedIds.filter((id) => id !== neuronId)
          : Array.from(new Set([...selectedIds, neuronId])),
      }));
    },
  };
};

export const voteRegistrationStore = initVoteRegistrationStore();
export const votingNeuronSelectStore = initNeuronSelectStore();
