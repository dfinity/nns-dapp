import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { writable, type Readable } from "svelte/store";

export interface ProjectProposalData {
  proposals: SnsProposalData[];
  // certified is an optimistic value - i.e. it represents the last value that has been pushed in store
  certified: boolean | undefined;
  // Whether all proposals have been loaded
  completed: boolean;
}
export interface SnsProposalsStoreData {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: ProjectProposalData;
}

export interface SnsProposalsStore extends Readable<SnsProposalsStoreData> {
  setProposals: (data: {
    rootCanisterId: Principal;
    proposals: SnsProposalData[];
    certified: boolean | undefined;
    completed: boolean;
  }) => void;
  addProposals: (data: {
    rootCanisterId: Principal;
    proposals: SnsProposalData[];
    certified: boolean | undefined;
    completed: boolean;
  }) => void;
  reset: () => void;
}

/**
 * A store that contains the sns proposals for each project.
 *
 * - setProposals: replace the current list of proposals for a specific sns project with a new list
 * - addProposals: add new proposals to the list of proposals for a specific sns project
 */
const initSnsProposalsStore = () => {
  const { subscribe, update, set } = writable<SnsProposalsStoreData>({});

  return {
    subscribe,

    setProposals({
      rootCanisterId,
      proposals,
      certified,
      completed,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
      certified: boolean | undefined;
      completed: boolean;
    }) {
      update((currentState: SnsProposalsStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          proposals: proposals,
          certified,
          completed,
        },
      }));
    },

    /** Add or replace proposals for a specific project */
    addProposals({
      rootCanisterId,
      proposals,
      certified,
      completed,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
      certified: boolean | undefined;
      completed: boolean;
    }) {
      update((currentState: SnsProposalsStoreData) => {
        const newIds = new Set(proposals.map(({ id }) => fromNullable(id)?.id));
        return {
          ...currentState,
          [rootCanisterId.toText()]: {
            proposals: [
              ...proposals,
              ...(currentState[rootCanisterId.toText()]?.proposals.filter(
                (proposal) => !newIds.has(fromNullable(proposal.id)?.id)
              ) ?? []),
            ],
            certified,
            completed,
          },
        };
      });
    },

    // Used in tests
    reset() {
      set({});
    },
  };
};

export const snsProposalsStore = initSnsProposalsStore();
