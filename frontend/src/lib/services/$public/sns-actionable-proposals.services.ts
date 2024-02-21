import { queryProposals, querySnsNeurons } from "$lib/api/sns-governance.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { votableSnsNeurons } from "$lib/utils/sns-neuron.utils";
import type { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import type { SnsListProposalsResponse, SnsNeuron } from "@dfinity/sns";
import { SnsProposalRewardStatus } from "@dfinity/sns";
import { fromDefinedNullable, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

export const updateActionableSnsProposals = async () => {
  const canisterIds = get(selectableUniversesStore)
    // skip nns
    .filter(({ canisterId }) => canisterId !== OWN_CANISTER_ID_TEXT)
    .map(({ canisterId }) => canisterId);

  await Promise.all(
    canisterIds.map((canisterId) => updateActionableProposalsForSns(canisterId))
  );
};

const updateActionableProposalsForSns = async (
  canisterId: string
): Promise<void> => {
  try {
    const storeValue = get(actionableSnsProposalsStore)[canisterId];
    if (nonNullish(storeValue)) {
      // The proposals state does not update frequently, so we don't need to re-fetch.
      // The store will be reset after the user registers a vote.
      return;
    }

    const identity = await getAuthenticatedIdentity();
    const neurons = await queryNeurons({
      rootCanisterId: canisterId,
      identity,
    });

    // no need to fetch proposals if there are no neurons to vote with
    if (neurons.length === 0) {
      return;
    }

    const { proposals: allProposals, include_ballots_by_caller } =
      await querySnsProposals(canisterId);
    const includeBallotsByCaller = fromDefinedNullable(
      include_ballots_by_caller
    );

    if (!includeBallotsByCaller) {
      // It's not possible to filter out proposals that are votable w/o ballots
      return;
    }

    const votableProposals = allProposals.filter(
      (proposal) =>
        votableSnsNeurons({
          neurons,
          proposal,
          identity,
        }).length > 0
    );

    actionableSnsProposalsStore.setProposals({
      rootCanisterId: Principal.fromText(canisterId),
      proposals: votableProposals,
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
const querySnsProposals = async (
  rootCanisterId: string
): Promise<SnsListProposalsResponse> => {
  const identity = await getAuthenticatedIdentity();
  return queryProposals({
    params: {
      limit: DEFAULT_SNS_PROPOSALS_PAGE_SIZE,
      includeRewardStatus: [
        SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      ],
    },
    identity,
    certified: false,
    rootCanisterId: Principal.fromText(rootCanisterId),
  });
};
