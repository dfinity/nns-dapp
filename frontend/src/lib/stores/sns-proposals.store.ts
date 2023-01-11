import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { writable } from "svelte/store";

export interface ProjectProposalStore {
  proposals: SnsProposalData[];
  // certified is an optimistic value - i.e. it represents the last value that has been pushed in store
  certified: boolean | undefined;
}
export interface SnsProposalsStore {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: ProjectProposalStore;
}

/**
 * A store that contains the sns proposals for each project.
 *
 * - setProposals: replace the current list of proposals for a specific sns project with a new list
 * - addProposals: add new proposals to the list of proposals for a specific sns project
 */
const initSnsProposalsStore = () => {
  const { subscribe, update, set } = writable<SnsProposalsStore>({});

  return {
    subscribe,

    setProposals({
      rootCanisterId,
      proposals,
      certified,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
      certified: boolean | undefined;
    }) {
      update((currentState: SnsProposalsStore) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          proposals: proposals,
          certified,
        },
      }));
    },

    addProposals({
      rootCanisterId,
      proposals,
      certified,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
      certified: boolean | undefined;
    }) {
      update((currentState: SnsProposalsStore) => {
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
