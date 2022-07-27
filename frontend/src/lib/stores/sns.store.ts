import { ProposalStatus, type ProposalInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { derived, writable } from "svelte/store";
import type { SnsSummary, SnsSwapCommitment } from "../types/sns";
import type { QuerySnsSummary, QuerySnsSwapState } from "../types/sns.query";
import { mapAndSortSnsQueryToSummaries } from "../utils/sns.utils";
import { isNullish } from "../utils/utils";

// ************** Proposals for Launchpad **************

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

const initOpenSnsProposalsStore = () =>
  derived([snsProposalsStore], ([$snsProposalsStore]): ProposalInfo[] =>
    isNullish($snsProposalsStore)
      ? []
      : $snsProposalsStore.proposals.filter(
          ({ status }) => status === ProposalStatus.PROPOSAL_STATUS_OPEN
        )
  );

export const snsProposalsStore = initSnsProposalsStore();
export const openSnsProposalsStore = initOpenSnsProposalsStore();

// ************** Sns summaries and swaps **************

export type SnsQueryStore =
  | {
      response: [QuerySnsSummary[], QuerySnsSwapState[]];
      certified: boolean;
    }
  | undefined
  | null;

const initSnsQueryStore = () => {
  const { subscribe, set } = writable<SnsQueryStore>(undefined);

  return {
    subscribe,

    reset() {
      set(undefined);
    },

    setLoadingState() {
      set(null);
    },

    setResponse(data: {
      response: [QuerySnsSummary[], QuerySnsSwapState[]];
      certified: boolean;
    }) {
      set(data);
    },
  };
};

/**
 * A store which contains the response of the queries performed against the backend to fetch summary and swap information of Snses.
 */
export const snsQueryStore = initSnsQueryStore();

/**
 * The response of the Snses about summary and swap derived to data that can be used by NNS-dapp - i.e. it filters undefined and optional swap data, sort data for consistency
 */
export const snsSummariesStore = derived(snsQueryStore, (data: SnsQueryStore) =>
  mapAndSortSnsQueryToSummaries(data?.response ?? [[], []])
);

// ************** Sns commitment **************

export type SnsSwapCommitmentsStore =
  | {
      swapCommitment: SnsSwapCommitment;
      certified: boolean;
    }[]
  | undefined
  | null;

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

export const snsSwapCommitmentsStore = initSnsSwapCommitmentsStore();

// ************** Goodies for UX/UI **************

// used to improve loading state display only
export const snsesCountStore = writable<number | undefined>(undefined);
