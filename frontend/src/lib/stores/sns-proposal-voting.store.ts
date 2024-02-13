import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

export interface SnsProposalVotingStoreData {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: SnsProposalData[];
}

export interface SnsProposalVotingStore
  extends Readable<SnsProposalVotingStoreData> {
  setProposals: (data: {
    rootCanisterId: Principal;
    proposals: SnsProposalData[];
  }) => void;
  reset: () => void;
}

/**
 * A store that contains nns proposals that can be voted on by the user (ballots w/ state 0).
 *
 * The update can't be merged with the current state because the proposals status can be updated.
 * - setProposals: replace the current list of proposals with a new list
 */
const initSnsProposalVotingStore = (): SnsProposalVotingStore => {
  const { subscribe, update, set } = writable<SnsProposalVotingStoreData>({});

  return {
    subscribe,

    setProposals({
      rootCanisterId,
      proposals,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
    }) {
      update((currentState: SnsProposalVotingStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: proposals,
      }));
    },

    // Used in tests
    reset(): void {
      set({});
    },
  };
};

// TODO(max): add to debug store
export const snsProposalVotingStore = initSnsProposalVotingStore();
