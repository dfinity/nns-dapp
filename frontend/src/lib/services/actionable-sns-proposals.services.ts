import { queryProposals } from "$lib/api/sns-governance.api";
import { MAX_ACTIONABLE_REQUEST_COUNT } from "$lib/constants/constants";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
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
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsProposalRewardStatus } from "@dfinity/sns";
import type { ProposalData } from "@dfinity/sns/dist/candid/sns_governance";
import { isNullish } from "@dfinity/utils";
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

    actionableSnsProposalsStore.set({
      rootCanisterId,
      proposals: votableProposals,
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
}): Promise<{ proposals: ProposalData[] }> => {
  let sortedProposals: ProposalData[] = [];
  for (
    let pagesLoaded = 0;
    pagesLoaded < MAX_ACTIONABLE_REQUEST_COUNT;
    pagesLoaded++
  ) {
    // Fetch all proposals that are accepting votes.
    const { proposals: page } = await queryProposals({
      params: {
        limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
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
    ]) as ProposalData[];

    // no more proposals available
    if (page.length !== DEFAULT_SNS_PROPOSALS_PAGE_SIZE) {
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
