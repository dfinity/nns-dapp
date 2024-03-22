import { removeKeys } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

export interface ActionableSnsProposalsData {
  proposals: SnsProposalData[];
  includeBallotsByCaller: boolean;
}
export interface ActionableSnsProposalsStoreData {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: ActionableSnsProposalsData;
}

export interface ActionableSnsProposalsStore
  extends Readable<ActionableSnsProposalsStoreData> {
  set: (data: {
    rootCanisterId: Principal;
    proposals: SnsProposalData[];
    includeBallotsByCaller: boolean;
  }) => void;
  resetForSns: (rootCanisterId: Principal) => void;
  resetForTesting: () => void;
}

/**
 * A store that contains sns proposals that can be voted on by the user (ballots w/ state 0).
 */
const initActionableSnsProposalsStore = (): ActionableSnsProposalsStore => {
  const { subscribe, update, set } = writable<ActionableSnsProposalsStoreData>(
    {}
  );

  return {
    subscribe,

    set({
      rootCanisterId,
      proposals,
      includeBallotsByCaller,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
      includeBallotsByCaller: boolean;
    }) {
      update((currentState: ActionableSnsProposalsStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          proposals,
          includeBallotsByCaller,
        },
      }));
    },

    resetForSns(rootCanisterId: Principal) {
      update((currentState: ActionableSnsProposalsStoreData) =>
        removeKeys({
          obj: currentState,
          keysToRemove: [rootCanisterId.toText()],
        })
      );
    },

    resetForTesting(): void {
      set({});
    },
  };
};

export const actionableSnsProposalsStore = initActionableSnsProposalsStore();
