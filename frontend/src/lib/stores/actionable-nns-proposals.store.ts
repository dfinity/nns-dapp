import type { ProposalInfo } from "@dfinity/nns";
import { writable, type Readable } from "svelte/store";

export interface ActionableNnsProposalsStoreData {
  proposals: ProposalInfo[] | undefined;
  fetchLimitReached: boolean;
}

export interface ActionableNnsProposalsStore
  extends Readable<ActionableNnsProposalsStoreData> {
  setProposals: (proposals: ProposalInfo[]) => void;
  setFetchLimitReached: (wasLimitReached: boolean) => void;
  reset: () => void;
}

/**
 * A store that contains proposals that can be voted on by the user (ballots w/ state 0).
 * Better keep nns and sns stores separate, as they should be available for "Actionable Proposals" tab.
 * This can't be derived from proposalsStore because that store contains only proposals that match the selected filter, while this store contains proposals regardless of the filter.
 */
const initActionableNnsProposalsStore = (): ActionableNnsProposalsStore => {
  const { subscribe, update } = writable<ActionableNnsProposalsStoreData>({
    proposals: undefined,
    fetchLimitReached: false,
  });

  return {
    subscribe,

    setFetchLimitReached(wasLimitReached: boolean) {
      update((state) => ({ ...state, fetchLimitReached: wasLimitReached }));
    },

    setProposals(proposals: ProposalInfo[]) {
      update((state) => ({ ...state, proposals: [...proposals] }));
    },

    reset(): void {
      update((state) => ({ ...state, proposals: undefined }));
    },
  };
};

export const actionableNnsProposalsStore = initActionableNnsProposalsStore();
