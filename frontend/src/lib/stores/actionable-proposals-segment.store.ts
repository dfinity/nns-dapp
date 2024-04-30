import { writable, type Readable } from "svelte/store";

export type ActionableSegmentSelection = "all" | "actionable";

export interface ActionableProposalsSegmentStoreData {
  selected: ActionableSegmentSelection | undefined;
}

export interface ActionableProposalsSegmentStore
  extends Readable<ActionableProposalsSegmentStoreData> {
  set: (selected: ActionableSegmentSelection) => void;
  resetForTesting: () => void;
}

/**
 * A store that contains selected state of actionable proposals segment.
 * By default, it's "all" and not stored in LocalStorage.
 */
const initActionableProposalsSegmentStore =
  (): ActionableProposalsSegmentStore => {
    const { subscribe, set } = writable<ActionableProposalsSegmentStoreData>({
      selected: undefined,
    });

    return {
      subscribe,

      set(selected: ActionableSegmentSelection) {
        set({ selected });
      },

      resetForTesting(): void {
        set({ selected: undefined });
      },
    };
  };

export const actionableProposalsSegmentStore =
  initActionableProposalsSegmentStore();
