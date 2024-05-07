import { writable, type Readable } from "svelte/store";

export type ActionableSegmentSelection = "all" | "actionable";

export interface ActionableProposalsSegmentStoreData {
  selected: ActionableSegmentSelection;
}

export interface ActionableProposalsSegmentStore
  extends Readable<ActionableProposalsSegmentStoreData> {
  set: (selected: ActionableSegmentSelection) => void;
  resetForTesting: () => void;
}

/**
 * A store that contains selected state of actionable proposals segment.
 * By default, it's "actionable" and not stored in LocalStorage.
 */
const initActionableProposalsSegmentStore =
  (): ActionableProposalsSegmentStore => {
    const { subscribe, set } = writable<ActionableProposalsSegmentStoreData>({
      selected: "actionable",
    });

    return {
      subscribe,

      set(selected: ActionableSegmentSelection) {
        set({ selected });
      },

      resetForTesting(): void {
        set({ selected: "actionable" });
      },
    };
  };

export const actionableProposalsSegmentStore =
  initActionableProposalsSegmentStore();
