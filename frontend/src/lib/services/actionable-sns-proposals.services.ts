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
import { fromNullable, isNullish } from "@dfinity/utils";
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
    const { proposals: allProposals, includeBallotsByCaller } =
      await querySnsProposals({
        rootCanisterId: rootCanisterIdText,
        identity,
      });

    failedActionableSnsesStore.remove(rootCanisterIdText);

    if (!includeBallotsByCaller) {
      // No need to fetch neurons if there are no actionable proposals support.
      actionableSnsProposalsStore.set({
        rootCanisterId,
        proposals: [],
        includeBallotsByCaller,
      });
      return;
    }

    const neurons = await queryNeurons({
      rootCanisterId,
    });

    // It's not possible to filter out votable proposals w/o ballots
    const votableProposals = includeBallotsByCaller
      ? allProposals.filter(
          (proposal) =>
            votableSnsNeurons({
              neurons,
              proposal,
              identity,
            }).length > 0
        )
      : [];

    actionableSnsProposalsStore.set({
      rootCanisterId,
      proposals: votableProposals,
      includeBallotsByCaller,
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
}): Promise<{ proposals: ProposalData[]; includeBallotsByCaller: boolean }> => {
  let sortedProposals: ProposalData[] = [];
  let includeBallotsByCaller = false;
  for (
    let pagesLoaded = 0;
    pagesLoaded < MAX_ACTIONABLE_REQUEST_COUNT;
    pagesLoaded++
  ) {
    // Fetch all proposals that are accepting votes.
    const { proposals: page, include_ballots_by_caller } = await queryProposals(
      {
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
      }
    );

    // Sort proposals by id in descending order to be sure that "lastProposalId" returns correct id.
    sortedProposals = sortSnsProposalsById([
      ...sortedProposals,
      ...page,
    ]) as ProposalData[];
    // Canisters w/o ballot support, returns undefined for `include_ballots_by_caller`.
    includeBallotsByCaller = fromNullable(include_ballots_by_caller) ?? false;

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
    includeBallotsByCaller,
  };
};
