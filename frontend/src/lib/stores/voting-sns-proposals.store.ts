import type { Principal } from "@dfinity/principal";
import type { SnsProposalData } from "@dfinity/sns";
import { writable, type Readable } from "svelte/store";

export interface VotingSnsProposalsStoreData {
  // Each SNS Project is an entry in this Store.
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: SnsProposalData[];
}

export interface VotingSnsProposalsStore
  extends Readable<VotingSnsProposalsStoreData> {
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
const initVotingSnsProposalsStore = (): VotingSnsProposalsStore => {
  const { subscribe, update, set } = writable<VotingSnsProposalsStoreData>({});

  return {
    subscribe,

    setProposals({
      rootCanisterId,
      proposals,
    }: {
      rootCanisterId: Principal;
      proposals: SnsProposalData[];
    }) {
      update((currentState: VotingSnsProposalsStoreData) => ({
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
export const votingSnsProposalsStore = initVotingSnsProposalsStore();
