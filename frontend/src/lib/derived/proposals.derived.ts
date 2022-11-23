import { authStore } from "$lib/stores/auth.store";
import { definedNeuronsStore } from "$lib/stores/neurons.store";
import type {
  ProposalsFiltersStore,
  ProposalsStore,
} from "$lib/stores/proposals.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import {
  voteRegistrationStore,
  type VoteRegistration,
} from "$lib/stores/vote-registration.store";
import { hideProposal } from "$lib/utils/proposals.utils";
import type { Identity } from "@dfinity/agent";
import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
import { derived, type Readable } from "svelte/store";

/**
 * A derived store of the proposals store that ensure the proposals are sorted by their proposal ids descendant (as provided back by the backend)
 *
 * ⚠️ Proposals need to be sorted ⚠️
 *
 * Listing next proposals happens based on the last proposal id that finds place in the store.
 * If after a search, the id of the last element would remain the same as the id that has been just searched, we might trigger a next search with the exact same id.
 * Therefore, there would be a risk of endless loop.
 *
 */
export const sortedProposals: Readable<ProposalsStore> = derived(
  [proposalsStore],
  ([{ proposals, certified }]) => ({
    proposals: proposals.sort(({ id: proposalIdA }, { id: proposalIdB }) =>
      Number((proposalIdB ?? BigInt(0)) - (proposalIdA ?? BigInt(0)))
    ),
    certified,
  })
);

// HACK:
//
// 1. the governance canister does not implement a filter to hide proposals where all neurons have voted or are ineligible.
// 2. the governance canister interprets queries with empty filter (e.g. topics=[]) has "any" queries and returns proposals anyway. On the contrary, the Flutter app displays nothing if one filter is empty.
// 3. the Flutter app does not simply display nothing when a filter is empty but re-filter the results provided by the backend.
//
// In addition, we have implemented an "optimistic voting" feature.
//
// That's why we hide and re-process these proposals delivered by the backend on the client side.
const hide = ({
  proposalInfo,
  filters,
  neurons,
  registrations,
  identity,
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
  neurons: NeuronInfo[];
  registrations: VoteRegistration[];
  identity: Identity | undefined | null;
}): boolean =>
  hideProposal({
    filters,
    proposalInfo,
    neurons,
    identity,
  }) ||
  // hide proposals that are currently in the voting state
  registrations.find(({ proposalInfo: { id } }) => proposalInfo.id === id) !==
    undefined;

export interface UIProposalsStore {
  proposals: (ProposalInfo & { hidden: boolean })[];
  certified: boolean | undefined;
}

export const uiProposals: Readable<UIProposalsStore> = derived(
  [
    sortedProposals,
    proposalsFiltersStore,
    definedNeuronsStore,
    voteRegistrationStore,
    authStore,
  ],
  ([
    { proposals, certified },
    filters,
    neurons,
    { registrations },
    $authStore,
  ]) => ({
    proposals: proposals.map((proposalInfo) => ({
      ...proposalInfo,
      hidden: hide({
        proposalInfo,
        filters,
        neurons,
        registrations,
        identity: $authStore.identity,
      }),
    })),
    certified,
  })
);

export const filteredProposals: Readable<ProposalsStore> = derived(
  [uiProposals],
  ([{ proposals, certified }]) => ({
    proposals: proposals.filter((proposalInfo) => !proposalInfo.hidden),
    certified,
  })
);
