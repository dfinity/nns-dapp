import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";
import type { SnsSummary, SnsSwapCommitment } from "../types/sns";
import {
  filterActiveProjects,
  filterCommittedProjects,
} from "../utils/projects.utils";
import { snsSummariesStore, snsSwapCommitmentsStore } from "./sns.store";

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
export const projectsStore: Readable<SnsFullProject[] | undefined> = derived(
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

export const activePadProjectsStore = derived(
  projectsStore,
  (projects: SnsFullProject[] | undefined) => filterActiveProjects(projects)
);

export const committedProjectsStore = derived(
  projectsStore,
  (projects: SnsFullProject[] | undefined) => filterCommittedProjects(projects)
);
