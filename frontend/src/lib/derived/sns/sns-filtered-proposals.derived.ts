import {
  snsSelectedFiltersStore,
  type SnsFiltersStoreData,
} from "$lib/stores/sns-filters.store";
import {
  snsProposalsStore,
  type SnsProposalsStore,
  type SnsProposalsStoreData,
} from "$lib/stores/sns-proposals.store";
import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export const snsFilteredProposalsStore = derived<
  [SnsProposalsStore, Readable<SnsFiltersStoreData>],
  SnsProposalsStoreData
>(
  [snsProposalsStore, snsSelectedFiltersStore],
  ([proposalsStore, selectedFilters]) => {
    const filteredProposals = Object.entries(proposalsStore).reduce(
      (acc, [rootCanisterIdText, projectProposals]) => {
        const filteredProjectProposals = projectProposals.proposals.filter(
          (proposal) => {
            const projectSelectedFilters = selectedFilters[rootCanisterIdText];
            // Do not filter until filters are loaded
            if (isNullish(projectSelectedFilters)) {
              return true;
            }
            const proposalData = mapProposalInfo({
              proposalData: proposal,
              nsFunctions: projectSelectedFilters.topics.map(
                ({ value }) => value
              ),
            });
            const statusMatch =
              projectSelectedFilters.decisionStatus.length === 0 ||
              projectSelectedFilters.decisionStatus
                .map(({ value }) => value)
                .includes(proposalData.status);
            // TODO: Filter by reward status
            // TODO: Filter by nervous functions
            return statusMatch;
          }
        );
        return {
          ...acc,
          [rootCanisterIdText]: {
            proposals: filteredProjectProposals,
            certified: projectProposals.certified,
          },
        };
      },
      {}
    );
    return filteredProposals;
  }
);
