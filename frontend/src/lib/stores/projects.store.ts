import type { ProposalInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { derived, writable, type Readable } from "svelte/store";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
import type { SnsSummary, SnsSwapCommitment } from "../types/sns";
import { isProposalOpenForVotes } from "../utils/proposals.utils";
import { isNullish } from "../utils/utils";

export type SnsSummariesStore =
  | {
      summaries: SnsSummary[];
      certified: boolean;
    }
  | undefined
  | null;

export type SnsSwapCommitmentsStore =
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
    isNullish($snsProposalsStore)
      ? []
      : $snsProposalsStore.proposals.filter(isProposalOpenForVotes)
  );

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
  const { subscribe, update, set } =
    writable<SnsSwapCommitmentsStore>(undefined);

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

const initSnsProjectSelectedStore = () => {
  const { subscribe, set } = writable<Principal>(OWN_CANISTER_ID);

  return {
    subscribe,
    set,
  };
};

// used to improve loading state display only
export const snsesCountStore = writable<number | undefined>(undefined);

export const snsProposalsStore = initSnsProposalsStore();
export const openForVotesSnsProposalsStore =
  initOpenForVotesSnsProposalsStore();

export const snsSummariesStore = initSnsSummariesStore();
export const snsSwapCommitmentsStore = initSnsSwapCommitmentsStore();
export const snsProjectSelectedStore = initSnsProjectSelectedStore();

// TODO:
// 1. snsFullProjectsStore should not be exposed
// 2. it can be renamed to projectsStore
/**
 * Filter snsSummariesStore entries with projects that are open (for swap) only.
 * Additionally, contains SwapCommitment for every summary (when loaded).
 */
const snsFullProjectsStore: Readable<SnsFullProject[] | undefined> = derived(
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

const filterProjectsStore = ({
  swapLifecycle,
  $snsFullProjectsStore,
}: {
  swapLifecycle: SnsSwapLifecycle;
  $snsFullProjectsStore: SnsFullProject[] | undefined;
}) =>
  $snsFullProjectsStore === undefined
    ? undefined
    : $snsFullProjectsStore.filter(
        ({
          summary: {
            swap: {
              state: { lifecycle },
            },
          },
        }) => swapLifecycle === lifecycle
      );

export const openProjectsStore = derived(
  snsFullProjectsStore,
  ($snsFullProjectsStore: SnsFullProject[] | undefined) =>
    filterProjectsStore({
      swapLifecycle: SnsSwapLifecycle.Open,
      $snsFullProjectsStore,
    })
);

export const committedProjectsStore = derived(
  snsFullProjectsStore,
  ($snsFullProjectsStore: SnsFullProject[] | undefined) =>
    filterProjectsStore({
      swapLifecycle: SnsSwapLifecycle.Committed,
      $snsFullProjectsStore,
    })
);

export const isNnsProjectStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore: Principal) =>
    $snsProjectSelectedStore.toText() === OWN_CANISTER_ID.toText()
);
