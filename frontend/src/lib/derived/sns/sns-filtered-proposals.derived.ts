import {
  snsSelectedFiltersStore,
  type SnsFiltersStoreData,
} from "$lib/stores/sns-filters.store";
import {
  snsProposalsStore,
  type SnsProposalsStore,
  type SnsProposalsStoreData,
} from "$lib/stores/sns-proposals.store";
import { ALL_SNS_GENERIC_PROPOSAL_TYPES_ID } from "$lib/types/filters";
import { snsDecisionStatus } from "$lib/utils/sns-proposals.utils";
import { isSnsGenericNervousSystemTypeProposal } from "$lib/utils/sns.utils";
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
        const projectSelectedFilters = selectedFilters[rootCanisterIdText];
        // Skip the project if there are no filters for it.
        // This will cause the proposals to be `undefined` for a specific project.
        if (isNullish(projectSelectedFilters)) {
          return acc;
        }
        const filteredProjectProposals = projectProposals.proposals.filter(
          (proposal) => {
            const statusMatch =
              projectSelectedFilters.decisionStatus.length === 0 ||
              projectSelectedFilters.decisionStatus
                .map(({ value }) => value)
                .includes(snsDecisionStatus(proposal));

            const nervousFunctionsMatch =
              projectSelectedFilters.types.length === 0 ||
              projectSelectedFilters.types
                .map(({ value }) => value)
                .includes(
                  isSnsGenericNervousSystemTypeProposal(proposal)
                    ? // If "All generic functions" is checked, we want to match all generic proposal types.
                      ALL_SNS_GENERIC_PROPOSAL_TYPES_ID
                    : `${proposal.action}`
                );

            return statusMatch && nervousFunctionsMatch;
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
