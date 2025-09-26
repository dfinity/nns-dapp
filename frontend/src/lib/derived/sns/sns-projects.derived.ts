import {
  snsLatestRewardEventStore,
  type SnsLatestRewardEventStoreData,
} from "$lib/derived/sns-latest-reward-event.derived";
import {
  snsMetricsStore,
  type SnsMetricsStoreData,
} from "$lib/derived/sns-metrics.derived";
import {
  snsSummariesStore,
  snsSwapCommitmentsStore,
  type SnsSwapCommitmentsStore,
} from "$lib/stores/sns.store";
import type { RootCanisterIdText, SnsSwapCommitment } from "$lib/types/sns";
import type { MetricsDto } from "$lib/types/sns-aggregator";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import {
  filterActiveProjects,
  filterCommittedProjects,
  filterProjectsStatus,
} from "$lib/utils/projects.utils";
import { SnsSwapLifecycle, type SnsRewardEvent } from "@dfinity/sns";
import type { Principal } from "@icp-sdk/core/principal";
import { derived, type Readable } from "svelte/store";

// ************** Sns full project - all information **************

export interface SnsFullProject {
  rootCanisterId: Principal;
  summary: SnsSummaryWrapper;
  swapCommitment: SnsSwapCommitment | undefined;
  metrics: MetricsDto | undefined;
  latestRewardEvent: SnsRewardEvent | undefined;
}

/**
 * Derive Sns stores.
 * Match summary and swap information with user commitments for particular Sns.
 *
 * @return SnsFullProject[] | undefined What we called project - i.e. the summary and swap of a Sns with the user commitment etc.
 */
export const snsProjectsStore = derived<
  [
    Readable<SnsSummaryWrapper[]>,
    SnsSwapCommitmentsStore,
    Readable<SnsMetricsStoreData>,
    Readable<SnsLatestRewardEventStoreData>,
  ],
  SnsFullProject[]
>(
  [
    snsSummariesStore,
    snsSwapCommitmentsStore,
    snsMetricsStore,
    snsLatestRewardEventStore,
  ],
  ([
    summaries,
    $snsSwapStatesStore,
    $snsMetricsStore,
    $snsLatestRewardEventStore,
  ]): SnsFullProject[] =>
    summaries.map((summary) => {
      const { rootCanisterId } = summary;
      const summaryPrincipalAsText = rootCanisterId.toText();
      const swapCommitmentStoreEntry = $snsSwapStatesStore?.find(
        ({ swapCommitment: { rootCanisterId } }) =>
          rootCanisterId.toText() === summaryPrincipalAsText
      );
      const metrics = $snsMetricsStore[summaryPrincipalAsText];
      const latestRewardEvent =
        $snsLatestRewardEventStore[summaryPrincipalAsText];

      return {
        rootCanisterId,
        summary,
        swapCommitment: swapCommitmentStoreEntry?.swapCommitment,
        metrics,
        latestRewardEvent,
      };
    })
);

// The same projects but mapped by root canister id.
export const snsProjectsRecordStore = derived<
  Readable<SnsFullProject[]>,
  Record<RootCanisterIdText, SnsFullProject>
>(snsProjectsStore, (projects: SnsFullProject[]) =>
  Object.fromEntries(
    projects.map((project) => [project.rootCanisterId.toText(), project])
  )
);

export const snsProjectsActivePadStore = derived<
  Readable<SnsFullProject[]>,
  SnsFullProject[]
>(snsProjectsStore, (projects: SnsFullProject[]) =>
  filterActiveProjects(projects)
);

export const snsProjectsCommittedStore = derived<
  Readable<SnsFullProject[]>,
  SnsFullProject[]
>(snsProjectsStore, (projects: SnsFullProject[]) =>
  filterCommittedProjects(projects)
);

export const snsProjectsAdoptedStore = derived<
  Readable<SnsFullProject[]>,
  SnsFullProject[]
>(snsProjectsStore, (projects: SnsFullProject[]) =>
  filterProjectsStatus({ swapLifecycle: SnsSwapLifecycle.Adopted, projects })
);
