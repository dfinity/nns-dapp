import { queryProposals, querySnsNeurons } from "$lib/api/sns-governance.api";
import { MAX_ACTIONABLE_REQUEST_COUNT } from "$lib/constants/constants";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
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
import { fromNullable, nonNullish } from "@dfinity/utils";
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

const loadActionableProposalsForSns = async (
  rootCanisterId: Principal
): Promise<void> => {
  try {
    const rootCanisterIdText = rootCanisterId.toText();
    const storeValue = get(actionableSnsProposalsStore)[rootCanisterIdText];
    if (nonNullish(storeValue)) {
      // The proposals state does not update frequently, so we don't need to re-fetch.
      // The store will be reset after the user registers a vote.
      return;
    }

    const identity = await getAuthenticatedIdentity();
    const { proposals: allProposals, includeBallotsByCaller } =
      await querySnsProposals({
        rootCanisterId: rootCanisterIdText,
        identity,
      });

    if (!includeBallotsByCaller) {
      // No need to fetch neurons if there are no actionable proposals support.
      actionableSnsProposalsStore.set({
        rootCanisterId,
        proposals: [],
        includeBallotsByCaller,
      });
      return;
    }

    const neurons =
      get(snsNeuronsStore)[rootCanisterIdText]?.neurons ??
      // Fetch neurons if they are not in the store, but do not populate the store.
      // Otherwise, it will skip calling of the `syncSnsNeurons` function to check neurons stake against the balance of the subaccount.
      (await queryNeurons({
        rootCanisterId: rootCanisterIdText,
        identity,
      }));

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
  }
};

const queryNeurons = async ({
  rootCanisterId,
  identity,
}: {
  rootCanisterId: string;
  identity: Identity;
}): Promise<SnsNeuron[]> => {
  const storeNeurons = get(snsNeuronsStore)[rootCanisterId];
  if (nonNullish(storeNeurons?.neurons)) {
    return storeNeurons.neurons;
  }

  return await querySnsNeurons({
    identity,
    rootCanisterId: Principal.fromText(rootCanisterId),
    certified: false,
  });
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
