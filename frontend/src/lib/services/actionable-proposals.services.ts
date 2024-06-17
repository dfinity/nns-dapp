import { queryProposals as queryNnsProposals } from "$lib/api/proposals.api";
import {
  DEFAULT_LIST_PAGINATION_LIMIT,
  MAX_ACTIONABLE_REQUEST_COUNT,
} from "$lib/constants/constants";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { listNeurons } from "$lib/services/neurons.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
import { lastProposalId } from "$lib/utils/proposals.utils";
import type { ProposalInfo } from "@dfinity/nns";
import {
  ProposalRewardStatus,
  votableNeurons,
  type NeuronInfo,
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

  const proposals = await queryProposals();
  // Filter proposals that have at least one votable neuron
  const votableProposals = proposals.filter(
    (proposal) => votableNeurons({ neurons, proposal }).length > 0
  );

  actionableNnsProposalsStore.setProposals(votableProposals);
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
const queryProposals = async (): Promise<ProposalInfo[]> => {
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
      includeRewardStatus: [ProposalRewardStatus.AcceptVotes],
      certified: false,
    });
    // Sort proposals by id in descending order to be sure that "lastProposalId" returns correct id.
    sortedProposals = [...sortedProposals, ...page].sort(
      ({ id: proposalIdA }, { id: proposalIdB }) =>
        Number((proposalIdB ?? 0n) - (proposalIdA ?? 0n))
    );

    if (page.length !== DEFAULT_LIST_PAGINATION_LIMIT) {
      break;
    }

    if (pagesLoaded === MAX_ACTIONABLE_REQUEST_COUNT - 1) {
      console.error("Max actionable pages loaded");
    }
  }

  return sortedProposals;
};
