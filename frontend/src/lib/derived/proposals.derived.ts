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
      Number((proposalIdB ?? 0n) - (proposalIdA ?? 0n))
    ),
    certified,
  })
);

// HACK:
//
// 1. the governance canister does not implement a filter to hide proposals where all neurons have voted or are ineligible.
// 2. the app does not simply display nothing when a filter is empty but re-filter the results provided by the backend.
//
// In addition, we have implemented an "optimistic voting" feature.
//
// That's why we hide and re-process these proposals delivered by the backend on the client side.
const hide = ({
  proposalInfo,
  filters,
  neurons,
  identity,
}: {
  proposalInfo: ProposalInfo;
  filters: ProposalsFiltersStore;
  neurons: NeuronInfo[];
  identity: Identity | undefined | null;
}): boolean =>
  hideProposal({
    filters,
    proposalInfo,
    neurons,
    identity,
  });

export interface UIProposalsStore {
  proposals: (ProposalInfo & { hidden: boolean })[];
  certified: boolean | undefined;
}

export const uiProposals: Readable<UIProposalsStore> = derived(
  [sortedProposals, proposalsFiltersStore, definedNeuronsStore, authStore],
  ([{ proposals, certified }, filters, neurons, { identity }]) => ({
    proposals: proposals.map((proposalInfo) => ({
      ...proposalInfo,
      hidden: hide({
        proposalInfo,
        filters,
        neurons,
        identity,
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
