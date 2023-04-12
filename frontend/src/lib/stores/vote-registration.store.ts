import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import type { NeuronId, Vote } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export type VoteRegistrationStatus =
  | "vote-registration"
  | "post-update"
  | "complete";

export interface VoteRegistrationStoreEntry {
  status: VoteRegistrationStatus;
  /** Text version of nns or sns proposal id. */
  proposalIdString: string;
  neuronIds: NeuronId[];
  successfullyVotedNeuronIds: NeuronId[];
  vote: Vote;
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
} & Omit<VoteRegistrationStoreEntry, "status" | "successfullyVotedNeuronIds">;

export type VoteRegistrationStoreAddSuccessfullyVotedNeuronIdData = {
  proposalIdString: string;
  neuronId: NeuronId;
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
      neuronIds,
      canisterId,
    }: VoteRegistrationStoreAddData): void {
      const newEntry: VoteRegistrationStoreEntry = {
        status: "vote-registration",
        proposalIdString: proposalIdString,
        neuronIds,
        successfullyVotedNeuronIds: [],
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
      neuronId,
      canisterId,
    }: VoteRegistrationStoreAddSuccessfullyVotedNeuronIdData) {
      update(({ registrations }) => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          throw new Error("no registrations for canister id");
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
          // TODO(sns-voting): add test or throw
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
                successfullyVotedNeuronIds: Array.from(
                  new Set([
                    ...proposalRegistration.successfullyVotedNeuronIds,
                    neuronId,
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
          throw new Error("no registrations for canister id");
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
          // TODO(sns-voting): add test or throw
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

export const voteRegistrationStore = initVoteRegistrationStore();
