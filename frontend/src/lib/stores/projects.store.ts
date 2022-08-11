import type { Principal } from "@dfinity/principal";
import { derived, writable, type Readable } from "svelte/store";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
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

// ************** Selected project **************

const initSnsProjectSelectedStore = () => {
  const { subscribe, set } = writable<Principal>(OWN_CANISTER_ID);

  return {
    subscribe,
    set,
  };
};

/**
 * In Neurons or ultimately in Voting screen, user can select the "universe" - e.g. display Neurons of Nns or a particular Sns
 */
export const snsProjectSelectedStore = initSnsProjectSelectedStore();

/***
 * Is the selected project (universe) Nns?
 */
export const isNnsProjectStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore: Principal) =>
    $snsProjectSelectedStore.toText() === OWN_CANISTER_ID.toText()
);

/***
 * Returns undefined if the selected project is NNS, otherwise returns the selected project principal.
 */
export const snsOnlyProjectStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore: Principal) =>
    $snsProjectSelectedStore.toText() === OWN_CANISTER_ID.toText()
      ? undefined
      : $snsProjectSelectedStore
);
