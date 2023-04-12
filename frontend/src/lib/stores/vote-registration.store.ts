import type {
  UniverseCanisterId,
  UniverseCanisterIdText,
} from "$lib/types/universe";
import type { NeuronId, ProposalId, ProposalInfo, Vote } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export type VoteRegistrationStatus =
  | "vote-registration"
  | "post-update"
  | "complete";

export interface VoteRegistrationStoreEntry {
  status: VoteRegistrationStatus;
  proposalInfo: ProposalInfo;
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
  proposalId: ProposalId;
  neuronId: NeuronId;
  canisterId: UniverseCanisterId;
};

export type VoteRegistrationStoreUpdateStatusData = {
  proposalId: ProposalId;
  status: VoteRegistrationStatus;
  canisterId: UniverseCanisterId;
};

export type VoteRegistrationStoreRemoveData = {
  proposalId: ProposalId;
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
      proposalInfo,
      neuronIds,
      canisterId,
    }: VoteRegistrationStoreAddData): void {
      const newEntry: VoteRegistrationStoreEntry = {
        status: "vote-registration",
        proposalInfo,
        neuronIds,
        successfullyVotedNeuronIds: [],
        vote,
      };

      update(({ registrations }): VoteRegistrationStoreData => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          registrations[canisterId.toText()] = [newEntry];
          return { registrations };
        }

        if (
          universeRegistrations.find(
            ({ proposalInfo: { id } }) => id === proposalInfo.id
          )
        ) {
          // Proposal `id` is used for the store entries indentification
          // Simultaneous voting for the same proposal is blocked by UI. But this is so critical that the throw was added. Otherwise potential errors would be extremely difficult to detect.
          throw new Error("Simultaneous proposal voting");
        }

        return {
          registrations,
          [canisterId.toText()]: [...universeRegistrations, newEntry],
        };
      });
    },

    addSuccessfullyVotedNeuronId({
      proposalId,
      neuronId,
      canisterId,
    }: {
      proposalId: ProposalId;
      neuronId: NeuronId;
      canisterId: UniverseCanisterId;
    }) {
      update(({ registrations }) => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          throw new Error("no registrations for canister id");
        }

        const proposalRegistration = universeRegistrations.find(
          ({ proposalInfo: { id } }) => id === proposalId
        );

        if (proposalRegistration === undefined) {
          console.error(
            "updating not voting item",
            canisterId.toText(),
            proposalId
          );
          // TODO: add test or throw
          return { registrations };
        }

        return {
          registrations: {
            ...registrations,
            [canisterId.toText()]: [
              ...universeRegistrations.filter(
                ({ proposalInfo: { id } }) => id !== proposalId
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
      proposalId,
      status,
      canisterId,
    }: {
      proposalId: ProposalId;
      status: VoteRegistrationStatus;
      canisterId: UniverseCanisterId;
    }) {
      update(({ registrations }) => {
        const universeRegistrations = registrations[canisterId.toText()];

        if (universeRegistrations === undefined) {
          throw new Error("no registrations for canister id");
        }

        const proposalRegistration = universeRegistrations.find(
          ({ proposalInfo: { id } }) => id === proposalId
        );

        if (proposalRegistration === undefined) {
          console.error(
            "updating not voting item",
            canisterId.toText(),
            proposalId
          );
          // TODO: add test or throw
          return { registrations };
        }

        return {
          registrations: {
            ...registrations,
            [canisterId.toText()]: [
              ...universeRegistrations.filter(
                ({ proposalInfo: { id } }) => id !== proposalId
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

    remove({
      proposalId,
      canisterId,
    }: {
      proposalId: ProposalId;
      canisterId: UniverseCanisterId;
    }) {
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
                ({ proposalInfo: { id } }) => id !== proposalId
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
