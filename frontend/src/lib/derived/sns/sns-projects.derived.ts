import {
  snsSummariesStore,
  snsSwapCommitmentsStore,
  type SnsSwapCommitmentsStore,
} from "$lib/stores/sns.store";
import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import {
  filterActiveProjects,
  filterCommittedProjects,
  filterProjectsStatus,
} from "$lib/utils/projects.utils";
import type { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
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
export const snsProjectsStore = derived<
  [Readable<SnsSummary[]>, SnsSwapCommitmentsStore],
  SnsFullProject[]
>(
  [snsSummariesStore, snsSwapCommitmentsStore],
  ([summaries, $snsSwapStatesStore]): SnsFullProject[] => {
    console.log('dskloetx summaries', summaries.map(s => s.token.name));
    return summaries.map((summary) => {
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
    });
  }
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
