import { removeKeys } from "$lib/utils/utils";
import type { CanisterIdString } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

export interface ActionableSnsProposalsData {
  proposals: SnsProposalData[];
  fetchLimitReached: boolean;
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
    fetchLimitReached?: boolean;
  }) => void;
  resetForSns: (rootCanisterId: Principal) => void;
  resetForTesting: () => void;
}
export type FailedActionableSnsesStoreData = CanisterIdString[];
interface FailedActionableSnsesStore
  extends Readable<FailedActionableSnsesStoreData> {
  add: (rootCanisterId: string) => void;
  remove: (rootCanisterId: string) => void;
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
      fetchLimitReached = false,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
      fetchLimitReached?: boolean;
    }) {
      update((currentState: ActionableSnsProposalsStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: {
          ...currentState[rootCanisterId.toText()],
          fetchLimitReached,
          proposals,
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

/**
 * A store that contains root canister ids of SNS projects that failed to load actionable proposals.
 */
const initFailedActionableSnsesStore = (): FailedActionableSnsesStore => {
  const { subscribe, update, set } = writable<string[]>([]);

  return {
    subscribe,

    add(rootCanisterId: string) {
      update((currentState: string[]) =>
        Array.from(new Set([...currentState, rootCanisterId]))
      );
    },

    remove(rootCanisterId: string) {
      update((currentState: string[]) =>
        currentState.filter((id) => id !== rootCanisterId)
      );
    },

    resetForTesting(): void {
      set([]);
    },
  };
};

export const actionableSnsProposalsStore = initActionableSnsProposalsStore();
export const failedActionableSnsesStore = initFailedActionableSnsesStore();
