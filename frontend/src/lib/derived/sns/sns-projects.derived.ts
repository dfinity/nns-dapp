import {
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "$lib/stores/sns.store";
import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import {
  filterActiveProjects,
  filterCommittedProjects,
} from "$lib/utils/projects.utils";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

// ************** Sns full project - all information **************

export interface SnsFullProject {
  rootCanisterId: Principal;
  summary: SnsSummary;
  swapCommitment: SnsSwapCommitment | undefined;
}

/**
 * Derive Sns stores.
 * Match summary and swap information with user commitments for particular Sns.
 *
 * @return SnsFullProject[] | undefined What we called project - i.e. the summary and swap of a Sns with the user commitment
 */
export const snsProjectsStore: Readable<SnsFullProject[] | undefined> = derived(
  [snsSummariesStore, snsSwapCommitmentsStore],
  ([summaries, $snsSwapStatesStore]): SnsFullProject[] | undefined =>
    summaries?.map((summary) => {
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

export const snsProjectsActivePadStore = derived<
  Readable<SnsFullProject[] | undefined>,
  SnsFullProject[] | undefined
>(snsProjectsStore, (projects: SnsFullProject[] | undefined) =>
  filterActiveProjects(projects)
);

export const snsProjectsCommittedStore = derived<
  Readable<SnsFullProject[] | undefined>,
  SnsFullProject[] | undefined
>(snsProjectsStore, (projects: SnsFullProject[] | undefined) =>
  filterCommittedProjects(projects)
);
