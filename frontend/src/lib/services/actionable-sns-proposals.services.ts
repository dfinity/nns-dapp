import { queryProposals } from "$lib/api/sns-governance.api";
import {
  DEFAULT_LIST_PAGINATION_LIMIT,
  MAX_ACTIONABLE_REQUEST_COUNT,
} from "$lib/constants/constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { loadSnsNeurons } from "$lib/services/sns-neurons.services";
import {
  actionableSnsProposalsStore,
  failedActionableSnsesStore,
} from "$lib/stores/actionable-sns-proposals.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { votableSnsNeurons } from "$lib/utils/sns-neuron.utils";
import {
  lastProposalId,
  sortSnsProposalsById,
} from "$lib/utils/sns-proposals.utils";
import type { SnsNeuron, SnsProposalData } from "@dfinity/sns";
import { SnsProposalRewardStatus } from "@dfinity/sns";
import { isNullish } from "@dfinity/utils";
import type { Identity } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { get } from "svelte/store";

export const loadActionableSnsProposals = async () => {
  const rootCanisterIds = get(snsProjectsCommittedStore).map(
    ({ rootCanisterId }) => rootCanisterId
  );

  await Promise.all(
    rootCanisterIds.map((rootCanisterId) =>
      loadActionableProposalsForSns(rootCanisterId)
    )
  );
};

export const loadActionableProposalsForSns = async (
  rootCanisterId: Principal
): Promise<void> => {
  try {
    const rootCanisterIdText = rootCanisterId.toText();
    const identity = await getAuthenticatedIdentity();
    const { proposals: allProposals } = await querySnsProposals({
      rootCanisterId: rootCanisterIdText,
      identity,
    });

    failedActionableSnsesStore.remove(rootCanisterIdText);

    const neurons = await queryNeurons({
      rootCanisterId,
    });

    const votableProposals = allProposals.filter(
      (proposal) =>
        votableSnsNeurons({
          neurons,
          proposal,
          identity,
        }).length > 0
    );

    const fetchLimitReached =
      Math.max(allProposals.length) ===
      DEFAULT_LIST_PAGINATION_LIMIT * MAX_ACTIONABLE_REQUEST_COUNT;

    actionableSnsProposalsStore.set({
      rootCanisterId,
      proposals: votableProposals,
      fetchLimitReached,
    });
  } catch (err) {
    console.error(err);

    // Store the failed root canister ID to provide the correct loading state.
    failedActionableSnsesStore.add(rootCanisterId.toText());
  }
};

const queryNeurons = async ({
  rootCanisterId,
}: {
  rootCanisterId: Principal;
}): Promise<SnsNeuron[]> => {
  const getStoreNeurons = () =>
    get(snsNeuronsStore)[rootCanisterId.toText()]?.neurons;
  if (isNullish(getStoreNeurons())) {
    await loadSnsNeurons({ rootCanisterId, certified: false });
  }
  return getStoreNeurons();
};

/** Fetches proposals that accept votes */
const querySnsProposals = async ({
  rootCanisterId,
  identity,
}: {
  rootCanisterId: string;
  identity: Identity;
}): Promise<{ proposals: SnsProposalData[] }> => {
  let sortedProposals: SnsProposalData[] = [];
  for (
    let pagesLoaded = 0;
    pagesLoaded < MAX_ACTIONABLE_REQUEST_COUNT;
    pagesLoaded++
  ) {
    // Fetch all proposals that are accepting votes.
    const { proposals: page } = await queryProposals({
      params: {
        limit: DEFAULT_LIST_PAGINATION_LIMIT,
        includeRewardStatus: [
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        ],
        beforeProposal: lastProposalId(sortedProposals),
      },
      identity,
      certified: false,
      rootCanisterId: Principal.fromText(rootCanisterId),
    });

    // Sort proposals by id in descending order to be sure that "lastProposalId" returns correct id.
    sortedProposals = sortSnsProposalsById([
      ...sortedProposals,
      ...page,
    ]) as SnsProposalData[];

    // no more proposals available
    if (page.length !== DEFAULT_LIST_PAGINATION_LIMIT) {
      break;
    }

    if (pagesLoaded === MAX_ACTIONABLE_REQUEST_COUNT - 1) {
      console.error("Max actionable sns pages loaded");
    }
  }

  return {
    proposals: sortedProposals,
  };
};
