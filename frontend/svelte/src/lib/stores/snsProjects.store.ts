import type { Principal } from "@dfinity/principal";
import { derived, writable, type Readable } from "svelte/store";
import type { SnsSummary, SnsSwapState } from "../services/sns.mock";

export interface SnsSummariesStore {
  summaries: SnsSummary[] | undefined;
  certified: boolean | undefined;
}

export type SnsSwapStatesStore =
  | {
      swapState: SnsSwapState;
      certified: boolean;
    }[]
  | undefined;

export interface SnsFullProject {
  rootCanisterId: Principal;
  summary: SnsSummary;
  swapState: SnsSwapState | undefined;
}

export type SnsFullProjectStore = SnsFullProject[] | undefined;

const initSnsSummariesStore = () => {
  const { subscribe, set } = writable<SnsSummariesStore>({
    summaries: undefined,
    certified: undefined,
  });

  return {
    subscribe,

    reset() {
      set({
        summaries: undefined,
        certified: undefined,
      });
    },

    setSummaries({
      summaries,
      certified,
    }: {
      summaries: SnsSummary[];
      certified: boolean;
    }) {
      set({ summaries: [...summaries], certified });
    },
  };
};

const initSnsSwapStatesStore = () => {
  const { subscribe, update } = writable<SnsSwapStatesStore>(undefined);

  return {
    subscribe,

    setSwapState({
      swapState,
      certified,
    }: {
      swapState: SnsSwapState;
      certified: boolean;
    }) {
      update((items) => [
        ...(items ?? []).filter(
          ({ swapState: { rootCanisterId } }) =>
            rootCanisterId.toText() !== swapState.rootCanisterId.toText()
        ),
        {
          swapState,
          certified,
        },
      ]);
    },
  };
};

export const snsSummariesStore = initSnsSummariesStore();
export const snsSwapStatesStore = initSnsSwapStatesStore();

/**
 * Reflects snsSummariesStore entries. Additionally contains SwapState for every summary (when loaded).
 */
export const snsFullProjectStore: Readable<SnsFullProject[] | undefined> =
  derived(
    [snsSummariesStore, snsSwapStatesStore],
    ([{ summaries }, $snsSwapStatesStore]): SnsFullProject[] | undefined =>
      summaries === undefined
        ? undefined
        : summaries.map((summary) => {
            const { rootCanisterId } = summary;
            const summaryPrincipalAsText = rootCanisterId.toText();
            const swapStateStoreEntry = $snsSwapStatesStore?.find(
              ({ swapState: { rootCanisterId } }) =>
                rootCanisterId.toText() === summaryPrincipalAsText
            );
            return {
              rootCanisterId,
              summary,
              swapState: swapStateStoreEntry?.swapState,
            };
          })
  );
