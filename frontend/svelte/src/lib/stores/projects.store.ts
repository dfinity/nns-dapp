import type { Principal } from "@dfinity/principal";
import { derived, writable, type Readable } from "svelte/store";
import type { SnsSummary, SnsSwapCommitment } from "../types/sns";

export type SnsSummariesStore =
  | {
      summaries: SnsSummary[];
      certified: boolean;
    }
  | undefined
  | null;

export type SnsSwapStatesStore =
  | {
      swapCommitment: SnsSwapCommitment;
      certified: boolean;
    }[]
  | undefined
  | null;

export interface SnsFullProject {
  rootCanisterId: Principal;
  summary: SnsSummary;
  swapCommitment: SnsSwapCommitment | undefined;
}

export type SnsFullProjectsStore = SnsFullProject[] | undefined;

const initSnsSummariesStore = () => {
  const { subscribe, set } = writable<SnsSummariesStore>(undefined);

  return {
    subscribe,

    reset() {
      set(undefined);
    },

    setLoadingState() {
      set(null);
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

const initSnsSwapCommitmentsStore = () => {
  const { subscribe, update, set } = writable<SnsSwapStatesStore>(undefined);

  return {
    subscribe,

    setSwapCommitment({
      swapCommitment,
      certified,
    }: {
      swapCommitment: SnsSwapCommitment;
      certified: boolean;
    }) {
      update((items) => [
        ...(items ?? []).filter(
          ({ swapCommitment: { rootCanisterId } }) =>
            rootCanisterId.toText() !== swapCommitment.rootCanisterId.toText()
        ),
        {
          swapCommitment,
          certified,
        },
      ]);
    },

    reset() {
      set(undefined);
    },

    setLoadingState() {
      set(null);
    },
  };
};

// used to improve loading state display only
export const snsesCountStore = writable<number | undefined>(undefined);

export const snsSummariesStore = initSnsSummariesStore();
export const snsSwapCommitmentsStore = initSnsSwapCommitmentsStore();

/**
 * Reflects snsSummariesStore entries. Additionally contains SwapState for every summary (when loaded).
 */
export const snsFullProjectsStore: Readable<SnsFullProject[] | undefined> =
  derived(
    [snsSummariesStore, snsSwapCommitmentsStore],
    ([$snsSummariesStore, $snsSwapStatesStore]): SnsFullProject[] | undefined =>
      $snsSummariesStore === undefined
        ? undefined
        : $snsSummariesStore?.summaries.map((summary) => {
            const { rootCanisterId } = summary;
            const summaryPrincipalAsText = rootCanisterId.toText();
            const swapCommitmentStoreEntry = $snsSwapStatesStore?.find(
              ({ swapCommitment: { rootCanisterId } }) =>
                rootCanisterId.toText() === summaryPrincipalAsText
            );

            return {
              rootCanisterId,
              summary,
              swapCommitment: swapCommitmentStoreEntry?.swapCommitment,
            };
          })
  );
