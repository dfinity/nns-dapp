import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import { mapAndSortSnsQueryToSummaries } from "$lib/utils/sns.utils";
import { isNullish } from "$lib/utils/utils";
import { ProposalStatus, type ProposalInfo } from "@dfinity/nns";
import { derived, writable, type Readable } from "svelte/store";

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
          ({ status }) => status === ProposalStatus.Open
        )
  );

export const snsProposalsStore = initSnsProposalsStore();
export const openSnsProposalsStore = initOpenSnsProposalsStore();

// ************** Sns summaries and swaps **************

export type SnsQueryWritableStore =
  | {
      metadata: QuerySnsMetadata[];
      swaps: QuerySnsSwapState[];
    }
  | undefined
  | null;

export interface SnsQueryStore extends Readable<SnsQueryWritableStore> {
  reset: () => void;
  setLoadingState: () => void;
  setData: (data: [QuerySnsMetadata[], QuerySnsSwapState[]]) => void;
  updateData: (data: {
    data: [QuerySnsMetadata | undefined, QuerySnsSwapState | undefined];
    rootCanisterId: string;
  }) => void;
  updateSwapState: (swap: {
    swapData: QuerySnsSwapState;
    rootCanisterId: string;
  }) => void;
}

/**
 * A store that contains the results of the queries (query and update) calls NNS-dapp performs to fetch Sns data from the backend.
 * Various derived stores will subscribe to this store to prepare, format and map the data in a way that can be use by the components.
 *
 * - reset: mark the store to not have been populated yet
 * - setLoadingState: explicitly set the store to not containing any data. useful to display various loading interaction while data are loaded
 * - setData: the function that initializes the store when the app starts
 * - updateData: a function to update the data of a particular root canister id - e.g. used to reload a particular sns project after user has participated to a sale
 */
const initSnsQueryStore = (): SnsQueryStore => {
  const { subscribe, set, update } = writable<SnsQueryWritableStore>(undefined);

  return {
    subscribe,

    reset() {
      set(undefined);
    },

    setLoadingState() {
      set(null);
    },

    setData([metadata, swaps]: [QuerySnsMetadata[], QuerySnsSwapState[]]) {
      set({
        metadata,
        swaps,
      });
    },

    /**
     * Note about undefined data (edge case):
     *
     * The data parameter can contain undefined values if the backend does not find the related info for the root canister id.
     * This should not happen since we update the store if the user interact with a project that was actually already successfully fetched.
     * However, if this would ever happen and to prevent issues, we clean up the store for the related root canister id.
     */
    updateData({
      data: [updatedMetadata, updatedSwap],
      rootCanisterId,
    }: {
      data: [QuerySnsMetadata | undefined, QuerySnsSwapState | undefined];
      rootCanisterId: string;
    }) {
      update((store: SnsQueryWritableStore) => ({
        metadata:
          updatedMetadata === undefined
            ? (store?.metadata ?? []).filter(
                ({ rootCanisterId: canisterId }) =>
                  canisterId !== rootCanisterId
              )
            : (store?.metadata ?? []).map((metadata) =>
                metadata.rootCanisterId === rootCanisterId
                  ? updatedMetadata
                  : metadata
              ),
        swaps:
          updatedSwap === undefined
            ? (store?.swaps ?? []).filter(
                ({ rootCanisterId: canisterId }) =>
                  canisterId !== rootCanisterId
              )
            : (store?.swaps ?? []).map((swap) =>
                swap.rootCanisterId === rootCanisterId ? updatedSwap : swap
              ),
      }));
    },

    /**
     * Updates only the swap state of a sale.
     *
     * @param {Object} params
     * @param {QuerySnsSwapState} params.swapData new swap data.
     * @param {string} params.rootCanisterId canister id in text format.
     */
    updateSwapState({
      swapData,
      rootCanisterId,
    }: {
      swapData: QuerySnsSwapState;
      rootCanisterId: string;
    }) {
      update((store: SnsQueryWritableStore) => ({
        metadata: store?.metadata ?? [],
        swaps: (store?.swaps ?? []).map((swap) =>
          swap.rootCanisterId === rootCanisterId ? swapData : swap
        ),
      }));
    },
  };
};

/**
 * A store which contains the response of the queries performed against the backend to fetch summary and swap information of Snses.
 */
export const snsQueryStore = initSnsQueryStore();

/**
 * The response of the Snses about metadata and swap derived to data that can be used by NNS-dapp - i.e. it filters undefined and optional swap data, sort data for consistency
 */
export const snsSummariesStore = derived<SnsQueryStore, SnsSummary[]>(
  snsQueryStore,
  (data: SnsQueryWritableStore) =>
    mapAndSortSnsQueryToSummaries({
      metadata: data?.metadata ?? [],
      swaps: data?.swaps ?? [],
    })
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
