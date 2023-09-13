import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import { differentSummaries } from "$lib/utils/projects.utils";
import { convertDtoToSnsSummary } from "$lib/utils/sns-aggregator-converters.utils";
import {
  convertDerivedStateResponseToDerivedState,
  mapAndSortSnsQueryToSummaries,
} from "$lib/utils/sns.utils";
import { ProposalStatus, type ProposalInfo } from "@dfinity/nns";
import type {
  SnsGetDerivedStateResponse,
  SnsSwapDerivedState,
  SnsSwapLifecycle,
} from "@dfinity/sns";
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { derived, writable, type Readable } from "svelte/store";
import { ENABLE_SNS_AGGREGATOR_STORE } from "./feature-flags.store";
import {
  snsAggregatorStore,
  type SnsAggregatorStore,
} from "./sns-aggregator.store";
import {
  snsDerivedStateStore,
  type SnsDerivedStateData,
  type SnsDerivedStateStore,
} from "./sns-derived-state.store";
import {
  snsLifecycleStore,
  type SnsLifecycleData,
  type SnsLifecycleStore,
} from "./sns-lifecycle.store";

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

export const snsProposalsStoreIsLoading = derived<
  Readable<SnsProposalsStore>,
  boolean
>(snsProposalsStore, (data: SnsProposalsStore) => isNullish(data));

// ************** Sns summaries and swaps **************

export type SnsQueryStoreData =
  | {
      metadata: QuerySnsMetadata[];
      swaps: QuerySnsSwapState[];
    }
  | undefined
  | null;

export interface SnsQueryStore extends Readable<SnsQueryStoreData> {
  reset: () => void;
  setData: (data: [QuerySnsMetadata[], QuerySnsSwapState[]]) => void;
  updateData: (data: {
    data: [QuerySnsMetadata | undefined, QuerySnsSwapState | undefined];
    rootCanisterId: string;
  }) => void;
  updateSwapState: (swap: {
    swapData: QuerySnsSwapState;
    rootCanisterId: string;
  }) => void;
  updateDerivedState: (swap: {
    derivedState: SnsGetDerivedStateResponse;
    rootCanisterId: string;
  }) => void;
  updateLifecycle: (swap: {
    lifecycle: SnsSwapLifecycle;
    rootCanisterId: string;
  }) => void;
}

/**
 * A store that contains the results of the queries (query and update) calls NNS-dapp performs to fetch Sns data from the backend.
 * Various derived stores will subscribe to this store to prepare, format and map the data in a way that can be use by the components.
 *
 * - reset: mark the store to not have been populated yet
 * - setData: the function that initializes the store when the app starts
 * - updateData: a function to update the data of a particular root canister id - e.g. used to reload a particular sns project after user has participated to a sale
 */
const initSnsQueryStore = (): SnsQueryStore => {
  const { subscribe, set, update } = writable<SnsQueryStoreData>(undefined);

  return {
    subscribe,

    reset() {
      set(undefined);
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
      update((data: SnsQueryStoreData) => ({
        metadata:
          updatedMetadata === undefined
            ? (data?.metadata ?? []).filter(
                ({ rootCanisterId: canisterId }) =>
                  canisterId !== rootCanisterId
              )
            : (data?.metadata ?? []).map((metadata) =>
                metadata.rootCanisterId === rootCanisterId
                  ? updatedMetadata
                  : metadata
              ),
        swaps:
          updatedSwap === undefined
            ? (data?.swaps ?? []).filter(
                ({ rootCanisterId: canisterId }) =>
                  canisterId !== rootCanisterId
              )
            : (data?.swaps ?? []).map((swap) =>
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
      update((data: SnsQueryStoreData) => ({
        metadata: data?.metadata ?? [],
        swaps: (data?.swaps ?? []).map((swap) =>
          swap.rootCanisterId === rootCanisterId ? swapData : swap
        ),
      }));
    },

    /**
     * Updates only the derived state of a sale.
     *
     * @param {Object} params
     * @param {SnsGetDerivedStateResponse} params.derivedState new derived state.
     * @param {string} params.rootCanisterId canister id in text format.
     */
    updateDerivedState({
      derivedState,
      rootCanisterId,
    }: {
      derivedState: SnsGetDerivedStateResponse;
      rootCanisterId: string;
    }) {
      const newDerivedState =
        convertDerivedStateResponseToDerivedState(derivedState);
      // Ignore updating the store if the mandatory fields are not present.
      if (isNullish(newDerivedState)) {
        return;
      }

      update((data: SnsQueryStoreData) => ({
        metadata: data?.metadata ?? [],
        swaps: (data?.swaps ?? []).map((swap) =>
          swap.rootCanisterId === rootCanisterId
            ? { ...swap, derived: [newDerivedState] }
            : swap
        ),
      }));
    },

    /**
     * Updates only the lifecycle of a sale.
     *
     * @param {Object} params
     * @param {SnsSwapLifecycle} params.lifecycle new lifecycle.
     * @param {string} params.rootCanisterId canister id in text format.
     */
    updateLifecycle({
      lifecycle,
      rootCanisterId,
    }: {
      lifecycle: SnsSwapLifecycle;
      rootCanisterId: string;
    }) {
      update((data: SnsQueryStoreData) => ({
        metadata: data?.metadata ?? [],
        swaps: (data?.swaps ?? []).map((swapData): QuerySnsSwapState => {
          if (swapData.rootCanisterId === rootCanisterId) {
            const swap = fromNullable(swapData.swap);
            if (nonNullish(swap)) {
              return {
                ...swapData,
                swap: [
                  {
                    ...swap,
                    lifecycle,
                  },
                ],
              };
            }
          }
          return swapData;
        }),
      }));
    },
  };
};

/**
 * A store which contains the response of the queries performed against the backend to fetch summary and swap information of Snses.
 */
export const snsQueryStore = initSnsQueryStore();

export const isLoadingSnsProjectsStore = derived<
  [SnsQueryStore, SnsAggregatorStore, Readable<boolean>],
  boolean
>(
  [snsQueryStore, snsAggregatorStore, ENABLE_SNS_AGGREGATOR_STORE],
  ([snsQueryStoreData, aggregatorData, aggregatorStoreEnabled]) =>
    aggregatorStoreEnabled
      ? isNullish(aggregatorData.data)
      : isNullish(snsQueryStoreData)
);

/**
 * Two similar endpoints return different types of data:
 * - get_derived_state returns SnsGetDerivedStateResponse
 * - the "derived" inside get_state returns SnsSwapDerivedState
 *
 * The SnsSummary was initially done from get_state.
 *
 * The difference is in two fields that are optional in the get_derived_state response.
 */
const convertToDerivedState = (
  data: SnsGetDerivedStateResponse
): SnsSwapDerivedState | undefined =>
  isNullish(fromNullable(data.sns_tokens_per_icp)) ||
  isNullish(data.buyer_total_icp_e8s)
    ? undefined
    : {
        ...data,
        sns_tokens_per_icp: fromDefinedNullable(data.sns_tokens_per_icp),
        buyer_total_icp_e8s: fromDefinedNullable(data.buyer_total_icp_e8s),
      };

/**
 * Override the derived state in the SnsSummary with the one from the store.
 */
const overrideDerivedState =
  (derivedStore: SnsDerivedStateData) =>
  (summary: SnsSummary | undefined): SnsSummary | undefined => {
    if (isNullish(summary)) {
      return undefined;
    }
    const projectDerivedState = derivedStore[summary.rootCanisterId.toText()];
    if (isNullish(projectDerivedState?.derivedState)) {
      return summary;
    }
    const convertedData = convertToDerivedState(
      projectDerivedState.derivedState
    );
    if (isNullish(convertedData)) {
      return summary;
    }
    return {
      ...summary,
      derived: convertedData,
    };
  };

/**
 * Override the lifecycle in the SnsSummary with the one from the store.
 */
const overrideLifecycle =
  (lifecycleStore: SnsLifecycleData) =>
  (summary: SnsSummary | undefined): SnsSummary | undefined => {
    if (isNullish(summary)) {
      return undefined;
    }
    const projectData = lifecycleStore[summary.rootCanisterId.toText()];
    const lifecycle = fromNullable(projectData?.data.lifecycle ?? []);
    if (isNullish(lifecycle)) {
      return summary;
    }
    const saleOpenTimestamp = fromNullable(
      projectData?.data.decentralization_sale_open_timestamp_seconds ?? []
    );
    return {
      ...summary,
      swap: {
        ...summary.swap,
        lifecycle,
        decentralization_sale_open_timestamp_seconds: saleOpenTimestamp,
      },
    };
  };

/**
 * The response of the Snses about metadata and swap derived to data that can be used by NNS-dapp - i.e. it filters undefined and optional swap data, sort data for consistency
 */
export const snsSummariesStore = derived<
  [
    SnsQueryStore,
    SnsAggregatorStore,
    SnsDerivedStateStore,
    SnsLifecycleStore,
    Readable<boolean>
  ],
  SnsSummary[]
>(
  [
    snsQueryStore,
    snsAggregatorStore,
    snsDerivedStateStore,
    snsLifecycleStore,
    ENABLE_SNS_AGGREGATOR_STORE,
  ],
  ([
    data,
    aggregatorData,
    derivedStates,
    lifecycles,
    enableSnsAggregatorStore,
  ]) => {
    const snsQuerySummaries = mapAndSortSnsQueryToSummaries({
      metadata: data?.metadata ?? [],
      swaps: data?.swaps ?? [],
    });

    if (!enableSnsAggregatorStore) {
      return snsQuerySummaries;
    }

    const aggregatorSummaries =
      aggregatorData.data
        ?.map(convertDtoToSnsSummary)
        .map(overrideDerivedState(derivedStates))
        .map(overrideLifecycle(lifecycles))
        .filter((optionalSummary): optionalSummary is SnsSummary =>
          nonNullish(optionalSummary)
        ) ?? [];

    // It might be that temporarily one store is not yet populated, while the other is.
    // That's why we wait until both are populated to compare them.
    if (
      snsQuerySummaries.length > 0 &&
      aggregatorSummaries.length > 0 &&
      aggregatorSummaries.length !== snsQuerySummaries.length
    ) {
      console.warn(
        `The aggregator and query data do not match. Aggregator data: ${aggregatorSummaries.length}, query data: ${snsQuerySummaries.length}.`
      );
    }

    if (
      snsQuerySummaries.length > 0 &&
      aggregatorSummaries.length === snsQuerySummaries.length &&
      differentSummaries(aggregatorSummaries, snsQuerySummaries).length > 0
    ) {
      console.warn(
        "The aggregator and query data do not match. Check below and the debug store for more information."
      );
      console.warn(differentSummaries(aggregatorSummaries, snsQuerySummaries));
    }

    // The aggregator data is fetched on init.
    // Derived state is fetched regularly in the background or after a participation. Therefore, we consider it as the latest data.
    // Lifecycle data is fetched after a participation. Therefore, we consider it as the latest data.
    return aggregatorSummaries;
  }
);

// ************** Sns commitment **************

export type SnsSwapCommitmentsStoreData =
  | {
      swapCommitment: SnsSwapCommitment;
      certified: boolean;
    }[]
  | undefined
  | null;

export interface SnsSwapCommitmentsStore
  extends Readable<SnsSwapCommitmentsStoreData> {
  setSwapCommitment: (data: {
    swapCommitment: SnsSwapCommitment;
    certified: boolean;
  }) => void;
  reset: () => void;
}

const initSnsSwapCommitmentsStore = (): SnsSwapCommitmentsStore => {
  const { subscribe, update, set } =
    writable<SnsSwapCommitmentsStoreData>(undefined);

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
  };
};

export const snsSwapCommitmentsStore = initSnsSwapCommitmentsStore();
