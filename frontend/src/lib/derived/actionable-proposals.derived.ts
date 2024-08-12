import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { authSignedInStore } from "$lib/derived/auth.derived";
import { pageStore } from "$lib/derived/page.derived";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import {
  actionableSnsProposalsStore,
  failedActionableSnsesStore,
} from "$lib/stores/actionable-sns-proposals.store";
import type { ProposalsNavigationId } from "$lib/types/proposals";
import type { Universe } from "$lib/types/universe";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import { mapEntries } from "$lib/utils/utils";
import type { SnsProposalData } from "@dfinity/sns";
import { fromDefinedNullable, isNullish, nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export interface ActionableProposalCountData {
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: number;
}

/** Returns true when the indication needs to be shown */
export const actionableProposalIndicationVisibleStore: Readable<boolean> =
  derived(
    [pageStore, authSignedInStore],
    ([{ path: currentPath }, isSignedIn]) =>
      isSignedIn &&
      isSelectedPath({
        currentPath,
        paths: [AppPath.Proposals],
      })
  );

/** Returns true when actionable are enabled (sign-in & selected)  */
export const actionableProposalsActiveStore: Readable<boolean> = derived(
  [actionableProposalsSegmentStore, authSignedInStore],
  ([{ selected }, isSignedIn]) => isSignedIn && selected === "actionable"
);

/** A store that contains the count of proposals that can be voted on by the user mapped by canister id (nns + snses) */
export const actionableProposalCountStore: Readable<ActionableProposalCountData> =
  derived(
    [actionableNnsProposalsStore, actionableSnsProposalsStore],
    ([{ proposals: nnsProposals }, actionableSnsProposals]) => ({
      // nns
      ...(isNullish(nnsProposals)
        ? {}
        : { [OWN_CANISTER_ID_TEXT]: nnsProposals?.length }),
      // sns
      ...mapEntries({
        obj: actionableSnsProposals,
        mapFn: ([canisterId, { proposals }]) => [canisterId, proposals.length],
      }),
    })
  );

/** A store that contains a total count of all actionable proposals (nns + snses) */
export const actionableProposalTotalCountStore: Readable<number> = derived(
  actionableProposalCountStore,
  (map) =>
    Object.values(map).reduce((acc: number, count) => acc + (count ?? 0), 0)
);

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

/** A store that returns true when all ‘Actionable Proposals’ have been loaded.
 */
export const actionableProposalsLoadedStore: Readable<boolean> = derived(
  [
    actionableNnsProposalsStore,
    actionableSnsProposalsStore,
    snsProjectsCommittedStore,
    failedActionableSnsesStore,
  ],
  ([nnsProposals, snsProposals, committedSnsProjects, failedSnses]) =>
    nonNullish(nnsProposals.proposals) &&
    // It is expected to have at least one SNS to cover when the projects have not yet been loaded.
    committedSnsProjects.length > 0 &&
    committedSnsProjects.length ===
      Object.keys(snsProposals).length + failedSnses.length
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
