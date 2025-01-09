import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import type { ProposalsNavigationId } from "$lib/types/proposals";
import type { Universe } from "$lib/types/universe";
import type { SnsProposalData } from "@dfinity/sns";
import { fromDefinedNullable, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";

export interface ActionableSnsProposalsByUniverseData {
  universe: Universe;
  proposals: SnsProposalData[];
}

/** A store that contains sns universes with actionable support and their actionable proposals
 * in the same order as they are displayed in the UI. */
export const actionableSnsProposalsByUniverseStore: Readable<
  Array<ActionableSnsProposalsByUniverseData>
> = derived(
  [selectableUniversesStore, actionableSnsProposalsStore],
  ([universes, actionableSnsProposals]) =>
    universes
      .filter(({ canisterId }) =>
        nonNullish(actionableSnsProposals[canisterId])
      )
      .map((universe) => ({
        universe,
        proposals: actionableSnsProposals[universe.canisterId].proposals,
      }))
);

// Generate list of ProposalsNavigationId using universes to provide correct order
// of proposals in the UI.
export const actionableProposalsNavigationIdsStore: Readable<
  Array<ProposalsNavigationId>
> = derived(
  [
    selectableUniversesStore,
    actionableNnsProposalsStore,
    actionableSnsProposalsStore,
  ],
  ([universes, nnsProposals, actionableSnsProposals]) =>
    universes
      .map(({ canisterId }) =>
        canisterId === OWN_CANISTER_ID_TEXT
          ? (nnsProposals.proposals ?? []).map(({ id }) => ({
              universe: OWN_CANISTER_ID_TEXT,
              proposalId: id as bigint,
            }))
          : (actionableSnsProposals[canisterId]?.proposals ?? []).map((aa) => ({
              universe: canisterId,
              proposalId: fromDefinedNullable(aa.id).id,
            }))
      )
      .flatMap((ids) => (nonNullish(ids) ? ids : []))
);
