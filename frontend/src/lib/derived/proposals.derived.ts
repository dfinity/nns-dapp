import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import type { ProposalsStore } from "$lib/stores/proposals.store";
import {
  proposalsFiltersStore,
  proposalsStore,
} from "$lib/stores/proposals.store";
import { hideProposal } from "$lib/utils/proposals.utils";
import type { ProposalInfo } from "@dfinity/nns";
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

export interface UIProposalsStore {
  proposals: (ProposalInfo & { hidden: boolean })[];
  certified: boolean | undefined;
}

export const uiProposals: Readable<UIProposalsStore> = derived(
  [sortedProposals, proposalsFiltersStore],
  ([{ proposals, certified }, filters]) => ({
    proposals: proposals.map((proposalInfo) => ({
      ...proposalInfo,
      hidden: hideProposal({
        proposalInfo,
        filters,
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

export type ActionableProposalInfo = ProposalInfo & {
  isActionable: boolean | undefined;
};

export interface FilteredActionableProposalsStore {
  proposals: ActionableProposalInfo[];
  certified: boolean | undefined;
}

export const filteredActionableProposals: Readable<FilteredActionableProposalsStore> =
  derived(
    [filteredProposals, actionableNnsProposalsStore],
    ([filteredProposalsStore, actionableProposalsStore]) => ({
      ...filteredProposalsStore,
      proposals: filteredProposalsStore.proposals.map((proposal) => ({
        ...proposal,
        isActionable: actionableProposalsStore?.proposals?.some(
          ({ id }) => id === proposal.id
        ),
      })),
    })
  );
