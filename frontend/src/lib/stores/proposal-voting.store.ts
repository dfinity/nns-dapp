import type { ProposalInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { writable, type Readable } from "svelte/store";

export interface VotingNnsProposalsStoreData {
  proposals?: ProposalInfo[];
}

export interface VotingNnsProposalsStore
  extends Readable<VotingNnsProposalsStoreData> {
  setProposals: (proposals: ProposalInfo[]) => void;
  reset: () => void;
}

/**
 * A store that contains proposals that can be voted on by the user (ballots w/ state 0).
 * Better keep nns and sns stores separate, as they should be available for "Voting Proposals" tab.
 *
 * The update can't be merged with the current state because the proposals status can be updated.
 * - setProposals: replace the current list of proposals with a new list
 */
const initVotingNnsProposalsStore = (): VotingNnsProposalsStore => {
  const { subscribe, set } = writable<VotingNnsProposalsStoreData>({
    proposals: undefined,
  });

  return {
    subscribe,

    setProposals(proposals: ProposalInfo[]) {
      set({ proposals: [...proposals] });
    },

    // Used in tests
    reset(): void {
      this.setProposals([]);
    },
  };
};

export interface VotingProposalCountStoreData {
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: number;
}

export interface VotingProposalCountStore
  extends Readable<VotingProposalCountStoreData> {
  setProposals: (data: { rootCanisterId: Principal; count: number }) => void;
  reset: () => void;
}

/**
 * A store that contains proposals that can be voted on by the user (ballots w/ state 0).
 *
 * The update can't be merged with the current state because the proposals status can be updated.
 * - setProposals: replace the current list of proposals with a new list
 */
const initVotingProposalCountStore = (): VotingProposalCountStore => {
  const { subscribe, update, set } = writable<VotingProposalCountStoreData>({});

  return {
    subscribe,

    setProposals({
      rootCanisterId,
      count,
    }: {
      rootCanisterId: Principal;
      count: number;
    }) {
      update((currentState: VotingProposalCountStoreData) => ({
        ...currentState,
        [rootCanisterId.toText()]: count,
      }));
    },

    // Used in tests
    reset(): void {
      set({});
    },
  };
};

export const votingProposalCountStore = initVotingProposalCountStore();
export const votingNnsProposalsStore = initVotingNnsProposalsStore();
