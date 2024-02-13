import { queryProposals, querySnsNeurons } from "$lib/api/sns-governance.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { DEFAULT_SNS_PROPOSALS_PAGE_SIZE } from "$lib/constants/sns-proposals.constants";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { votingSnsProposalsStore } from "$lib/stores/voting-sns-proposals.store";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron, SnsProposalData } from "@dfinity/sns";
import { SnsProposalRewardStatus } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

// TODO(max): use the store first, clean the store after user voted
export const queryNeuronsForSelectableSnses = async () => {
  const canisterIds = get(selectableUniversesStore)
    // skip nns
    .filter(({ canisterId }) => canisterId !== OWN_CANISTER_ID_TEXT)
    .map(({ canisterId }) => canisterId);

  // TODO(max): error handling?
  await Promise.all(
    // TODO(max): refactor me, need a separate function
    canisterIds.map(async (canisterId) => {
      const storeValue = get(votingSnsProposalsStore)[canisterId];
      if (nonNullish(storeValue)) {
        // already fetched
        return;
      }

      const neurons = await queryNeurons(canisterId);

      // TODO(max): apply also upcoming ballots here
      if (neurons?.length === 0) {
        return [];
      }
      const proposals = await querySnsProposals(canisterId);
      votingSnsProposalsStore.setProposals({
        rootCanisterId: Principal.fromText(canisterId),
        proposals,
      });
    })
  );
};

const queryNeurons = async (rootCanisterId: string): Promise<SnsNeuron[]> => {
  const storeNeurons = get(snsNeuronsStore)[rootCanisterId];
  if (nonNullish(storeNeurons?.neurons)) {
    return storeNeurons.neurons;
  }

  const identity = await getAuthenticatedIdentity();
  return await querySnsNeurons({
    identity,
    rootCanisterId: Principal.fromText(rootCanisterId),
    certified: false,
  });
};

const querySnsProposals = async (
  rootCanisterId: string
): Promise<SnsProposalData[]> => {
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

export const queryNeurons222 = async (): Promise<{
  [rootCanisterId: string]: SnsNeuron[];
}> => {
  const identity = await getAuthenticatedIdentity();
  const canisterIds = get(selectableUniversesStore)
    // skip nns
    .filter(({ canisterId }) => canisterId !== OWN_CANISTER_ID_TEXT)
    .map(({ canisterId }) => canisterId);
  const neurons = await Promise.all(
    canisterIds.map(
      async (canisterId) =>
        // get neurons from store if available
        get(snsNeuronsStore)[canisterId] ??
        // or fetch from the canister
        (await querySnsNeurons({
          identity,
          rootCanisterId: Principal.fromText(canisterId),
          certified: false,
        }))
    )
  );

  return canisterIds.reduce(
    (acc, canisterId, index) => ({
      ...acc,
      [canisterId]: neurons[index],
    }),
    {}
  );
};
