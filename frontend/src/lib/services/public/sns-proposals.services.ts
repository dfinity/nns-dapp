import {
  queryProposal,
  queryProposals,
  registerVote as registerVoteApi,
} from "$lib/api/sns-governance.api";
import { DEFAULT_LIST_PAGINATION_LIMIT } from "$lib/constants/constants";
import { createEnableFilteringBySnsTopicsStore } from "$lib/derived/sns-topics.derived";
import { getSnsNeuronIdentity } from "$lib/services/sns-neurons.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { snsSelectedFiltersStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import { toastsError } from "$lib/stores/toasts.store";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import {
  toExcludeTypeParameter,
  toIncludeTopicsParameter,
} from "$lib/utils/sns-proposals.utils";
import type {
  SnsListProposalsResponse,
  SnsNervousSystemFunction,
  SnsNeuronId,
  SnsProposalData,
  SnsProposalId,
  SnsVote,
} from "@dfinity/sns";
import { fromNullable, isNullish } from "@dfinity/utils";
import type { Principal } from "@icp-sdk/core/principal";
import { get } from "svelte/store";

export const registerVote = async ({
  rootCanisterId,
  neuronId,
  proposalId,
  vote,
}: {
  neuronId: SnsNeuronId;
  rootCanisterId: Principal;
  proposalId: SnsProposalId;
  vote: SnsVote;
}): Promise<{ success: boolean }> => {
  try {
    const identity = await getSnsNeuronIdentity();

    await registerVoteApi({
      rootCanisterId,
      identity,
      neuronId,
      proposalId,
      vote,
    });

    return { success: true };
  } catch (err) {
    toastsError({
      labelKey: "error__sns.sns_register_vote",
      substitutions: {
        $neuronId: subaccountToHexString(neuronId.id),
      },
      err,
    });
    return { success: false };
  }
};

export const loadSnsProposals = async ({
  rootCanisterId,
  snsFunctions,
  beforeProposalId,
}: {
  rootCanisterId: Principal;
  snsFunctions: SnsNervousSystemFunction[];
  beforeProposalId?: SnsProposalId;
}): Promise<void> => {
  const {
    types = [],
    decisionStatus = [],
    topics = [],
  } = get(snsSelectedFiltersStore)?.[rootCanisterId.toText()] || {};

  const includeStatus = decisionStatus.map(({ value }) => value);

  const isFilteringByTopicEnabled = get(
    createEnableFilteringBySnsTopicsStore(rootCanisterId)
  );
  const includeTopics = isFilteringByTopicEnabled
    ? toIncludeTopicsParameter(topics)
    : [];
  const excludeType = isFilteringByTopicEnabled
    ? []
    : toExcludeTypeParameter({
        filter: types,
        snsFunctions,
      });

  return queryAndUpdate<SnsListProposalsResponse, unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposals({
        params: {
          limit: DEFAULT_LIST_PAGINATION_LIMIT,
          beforeProposal: beforeProposalId,
          includeStatus,
          excludeType,
          includeTopics,
        },
        identity,
        certified,
        rootCanisterId,
      }),
    onLoad: ({ response, certified }) => {
      const { proposals, include_topic_filtering } = response;

      snsProposalsStore.addProposals({
        rootCanisterId,
        proposals,
        certified,
        completed: proposals.length < DEFAULT_LIST_PAGINATION_LIMIT,
      });

      const includeTopicFiltering = fromNullable(include_topic_filtering);

      if (isNullish(includeTopicFiltering)) {
        unsupportedFilterByTopicSnsesStore.add(rootCanisterId.toText());
      } else if (includeTopicFiltering) {
        unsupportedFilterByTopicSnsesStore.delete(rootCanisterId.toText());
      } else {
        unsupportedFilterByTopicSnsesStore.add(rootCanisterId.toText());
      }
    },
    onError: (err) => {
      toastsError({
        labelKey: "error.list_proposals",
        err,
      });
    },
    logMessage: "loadSnsProposals",
  });
};

/**
 * Calls the callback `setProposal` with the proposal found by the `proposalId` or `undefined` if not found.
 * - queryAndUpdate is used, and it calls the callback with the result twice.
 *
 * @param {Object} params
 * @param {Principal} params.rootCanisterId
 * @param {SnsProposalId} params.proposalId
 * @param {Function} params.handleError
 */
export const getSnsProposalById = async ({
  rootCanisterId,
  proposalId,
  setProposal,
  handleError,
}: {
  rootCanisterId: Principal;
  proposalId: SnsProposalId;
  setProposal: (params: {
    proposal: SnsProposalData;
    certified: boolean;
  }) => void;
  handleError?: (err: unknown) => void;
}): Promise<void> => {
  return queryAndUpdate<SnsProposalData, unknown>({
    identityType: "current",
    request: ({ certified, identity }) =>
      queryProposal({
        proposalId,
        identity,
        certified,
        rootCanisterId,
      }),
    onLoad: ({ response: proposal, certified }) => {
      setProposal({ proposal, certified });
    },
    onError: (err) => {
      toastsError({
        labelKey: "error.get_proposal",
        substitutions: {
          $proposalId: proposalId.id.toString(),
        },
        err,
      });
      handleError?.(err);
    },
    logMessage: "getSnsProposalById",
  });
};
