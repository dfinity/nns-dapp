import type { ProposalInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { derived, writable, type Readable } from "svelte/store";
import type { SnsSummary, SnsSwapState } from "../types/sns";
import { isProposalOpenForVotes } from "../utils/proposals.utils";
import { isNullable } from "../utils/utils";

// TODO: align summary store architecture with the certified information at the summary level
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

export type SnsProposalsStore =
  | {
      proposals: ProposalInfo[];
      certified: boolean;
    }
  | undefined
  | null;

const initSnsProposalsStore = () => {
  const { subscribe, set } = writable<SnsProposalsStore>(undefined);

  return {
    subscribe,

    reset() {
      set(undefined);
    },

    setLoadingState() {
      set(null);
    },

    setProposals({
      proposals,
      certified,
    }: {
      proposals: ProposalInfo[];
      certified: boolean;
    }) {
      set({
        proposals,
        certified,
      });
    },
  };
};

const initOpenForVotesSnsProposalsStore = () =>
  derived([snsProposalsStore], ([$snsProposalsStore]): ProposalInfo[] =>
    isNullable($snsProposalsStore)
      ? []
      : $snsProposalsStore.proposals.filter(isProposalOpenForVotes)
  );

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
  const { subscribe, update, set } = writable<SnsSwapStatesStore>(undefined);

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

    reset() {
      set(undefined);
    },
  };
};

// used to improve loading state display only
export const snsesCountStore = writable<number | undefined>(undefined);

export const snsProposalsStore = initSnsProposalsStore();
export const openForVotesSnsProposalsStore =
  initOpenForVotesSnsProposalsStore();

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
