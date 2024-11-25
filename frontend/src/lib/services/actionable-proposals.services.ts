import { queryProposals as queryNnsProposals } from "$lib/api/proposals.api";
import {
  DEFAULT_LIST_PAGINATION_LIMIT,
  MAX_ACTIONABLE_REQUEST_COUNT,
} from "$lib/constants/constants";
import { definedNeuronsStore } from "$lib/derived/neurons.derived";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { listNeurons } from "$lib/services/neurons.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  lastProposalId,
  sortProposalsByIdDescendingOrder,
} from "$lib/utils/proposals.utils";
import {
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
  votableNeurons,
  type NeuronInfo,
  type ProposalInfo,
} from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

/**
 * Fetch all proposals that are accepting votes and put them in the store.
 */
export const loadActionableProposals = async (): Promise<void> => {
  const neurons: NeuronInfo[] = await queryNeurons();
  if (neurons.length === 0) {
    actionableNnsProposalsStore.setProposals([]);
    return;
  }

  const acceptVotesProposals = await queryProposals({
    includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
  });
  // Request Neuron Management proposals that are open and have an ineligible reward
  // status because they don't have rewards (not ProposalRewardStatus.AcceptVotes),
  // but are still votable.
  // Only users which are listed explicitly in the followees of a Neuron Management proposal will get to
  // see such a proposal in the query response. So for most users the response will be empty.
  const neuronManagementProposals = await queryProposals({
    includeStatus: [ProposalStatus.Open],
    includeTopics: [Topic.NeuronManagement],
    // Technically, filtering by ProposalRewardStatus.Ineligible isn’t necessary,
    // but it ensures that the results are disjoint (acceptVotesProposals and neuronManagementProposals have no common items).
    includeRewardStatus: [ProposalRewardStatus.Ineligible],
  });
  // Filter proposals that have at least one votable neuron
  const votableProposals = [
    ...acceptVotesProposals,
    ...neuronManagementProposals,
  ].filter((proposal) => votableNeurons({ neurons, proposal }).length > 0);

  actionableNnsProposalsStore.setProposals(
    sortProposalsByIdDescendingOrder(votableProposals)
  );
};

const queryNeurons = async (): Promise<NeuronInfo[]> => {
  // Rely on the neurons store to avoid fetching neurons twice.Expecting the store to be managed outside of this function (e.g. on stake, disburse a neuron).
  if (isNullish(get(neuronsStore)?.neurons)) {
    // It's safe to populate the `neuronsStore` because it will be updated before neurons manipulations.
    await listNeurons({ strategy: "query" });
  }
  return get(definedNeuronsStore);
};

/// Fetch all (500 max) proposals that are accepting votes.
const queryProposals = async ({
  includeTopics,
  includeRewardStatus,
  includeStatus,
}: {
  includeTopics?: Topic[];
  includeRewardStatus?: ProposalRewardStatus[];
  includeStatus?: ProposalStatus[];
}): Promise<ProposalInfo[]> => {
  const identity = getCurrentIdentity();
  let sortedProposals: ProposalInfo[] = [];
  for (
    let pagesLoaded = 0;
    pagesLoaded < MAX_ACTIONABLE_REQUEST_COUNT;
    pagesLoaded++
  ) {
    // Fetch all proposals that are accepting votes.
    const page = await queryNnsProposals({
      beforeProposal: lastProposalId(sortedProposals),
      identity,
      certified: false,
      includeTopics,
      includeRewardStatus,
      includeStatus,
    });
    sortedProposals = sortProposalsByIdDescendingOrder([
      ...sortedProposals,
      ...page,
    ]);

    if (page.length !== DEFAULT_LIST_PAGINATION_LIMIT) {
      break;
    }

    if (pagesLoaded === MAX_ACTIONABLE_REQUEST_COUNT - 1) {
      console.error("Max actionable pages loaded");
    }
  }

  return sortedProposals;
};
