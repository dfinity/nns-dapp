import { mapEntries } from "$lib/utils/utils";
import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

export interface ActionableSnsProposalsStoreData {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: SnsProposalData[];
}

export interface ActionableSnsProposalsStore
  extends Readable<ActionableSnsProposalsStoreData> {
  setProposals: (data: {
    rootCanisterId: Principal;
    proposals: SnsProposalData[];
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

    setProposals({
      rootCanisterId,
      proposals,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
    }) {
      update((currentState: ActionableSnsProposalsStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: proposals,
      }));
    },

    resetForSns(rootCanisterId: Principal) {
      update((currentState: ActionableSnsProposalsStoreData) =>
        mapEntries({
          obj: currentState,
          mapFn: ([rootIdText, proposals]) =>
            rootIdText === rootCanisterId.toText()
              ? undefined
              : [rootIdText, proposals],
        })
      );
    },

    resetForTesting(): void {
      set({});
    },
  };
};

export const actionableSnsProposalsStore = initActionableSnsProposalsStore();
