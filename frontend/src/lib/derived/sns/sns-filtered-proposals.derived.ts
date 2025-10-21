import { ENABLE_SNS_TOPICS } from "$lib/stores/feature-flags.store";
import {
  snsSelectedFiltersStore,
  type SnsFiltersStoreData,
} from "$lib/stores/sns-filters.store";
import {
  snsProposalsStore,
  type SnsProposalsStore,
  type SnsProposalsStoreData,
} from "$lib/stores/sns-proposals.store";
import {
  unsupportedFilterByTopicSnsesStore,
  type UnsupportedFilterByTopicCanistersStoreData,
} from "$lib/stores/sns-unsupported-filter-by-topic.store";
import {
  ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
  ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
} from "$lib/types/filters";
import { snsDecisionStatus } from "$lib/utils/sns-proposals.utils";
import { snsTopicToTopicKey } from "$lib/utils/sns-topics.utils";
import { isSnsGenericNervousSystemTypeProposal } from "$lib/utils/sns.utils";
import { fromNullable, isNullish } from "@dfinity/utils";
import type { SnsTopic } from "@icp-sdk/canisters/sns";
import { derived, get, type Readable } from "svelte/store";

export const snsFilteredProposalsStore = derived<
  [
    SnsProposalsStore,
    Readable<SnsFiltersStoreData>,
    Readable<UnsupportedFilterByTopicCanistersStoreData>,
  ],
  SnsProposalsStoreData
>(
  [
    snsProposalsStore,
    snsSelectedFiltersStore,
    unsupportedFilterByTopicSnsesStore,
  ],
  ([proposalsStore, selectedFilters, unsupportedFilterByTopicSnses]) => {
    const filteredProposals = Object.entries(proposalsStore).reduce(
      (acc, [rootCanisterIdText, projectProposals]) => {
        const projectSelectedFilters = selectedFilters[rootCanisterIdText];
        // Skip the project if there are no filters for it.
        // This will cause the proposals to be `undefined` for a specific project.
        if (isNullish(projectSelectedFilters)) return acc;

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

            const topic = fromNullable(proposal.topic);
            const proposalTopic = isNullish(topic)
              ? ALL_SNS_PROPOSALS_WITHOUT_TOPIC
              : snsTopicToTopicKey(topic as SnsTopic);

            const proposalTopicMatch =
              projectSelectedFilters.topics.length === 0 ||
              projectSelectedFilters.topics
                .map(({ value }) => value)
                .includes(proposalTopic);

            const isTopicFilteringUnsupported =
              unsupportedFilterByTopicSnses.includes(rootCanisterIdText);

            const isTopicFilteringEnabled =
              get(ENABLE_SNS_TOPICS) && !isTopicFilteringUnsupported;

            if (isTopicFilteringEnabled)
              return statusMatch && proposalTopicMatch;

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
