import type { ProposalInfo } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export interface VotingNnsProposalsStoreData {
  proposals: ProposalInfo[] | undefined;
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

    reset(): void {
      set({ proposals: undefined });
    },
  };
};

export const votingNnsProposalsStore = initVotingNnsProposalsStore();
