import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import { convertDtoToSnsSummary } from "$lib/utils/sns-aggregator-converters.utils";
import { ProposalStatus, type ProposalInfo } from "@dfinity/nns";
import type {
  SnsGetDerivedStateResponse,
  SnsSwapDerivedState,
} from "@dfinity/sns";
import {
  fromDefinedNullable,
  fromNullable,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import { derived, writable, type Readable } from "svelte/store";
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

export const isLoadingSnsProjectsStore = derived<SnsAggregatorStore, boolean>(
  snsAggregatorStore,
  (aggregatorData) => isNullish(aggregatorData.data)
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
  [SnsAggregatorStore, SnsDerivedStateStore, SnsLifecycleStore],
  SnsSummary[]
>(
  [snsAggregatorStore, snsDerivedStateStore, snsLifecycleStore],
  ([aggregatorData, derivedStates, lifecycles]) => {
    // The aggregator data is fetched on init.
    const aggregatorSummaries =
      aggregatorData.data
        ?.map(convertDtoToSnsSummary)
        // Derived state is fetched regularly in the background or after a participation. Therefore, we consider it as the latest data.
        .map(overrideDerivedState(derivedStates))
        // Lifecycle data is fetched after a participation. Therefore, we consider it as the latest data.
        .map(overrideLifecycle(lifecycles))
        .filter((optionalSummary): optionalSummary is SnsSummary =>
          nonNullish(optionalSummary)
        ) ?? [];

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
