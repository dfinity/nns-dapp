import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { authSignedInStore } from "$lib/derived/auth.derived";
import { pageStore } from "$lib/derived/page.derived";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import type { Universe } from "$lib/types/universe";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import { mapEntries } from "$lib/utils/utils";
import type { SnsProposalData } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";

export interface ActionableProposalCountData {
  // We use the root canister id as the key to identify the proposals for a specific project.
  [rootCanisterId: string]: number | undefined;
}

/** Returns true when the indication needs to be shown */
// TODO(max): rename into actionableProposalIndicationVisibleStore (related to the visibility on neurons page bug)
export const actionableProposalIndicationEnabledStore: Readable<boolean> =
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
      [OWN_CANISTER_ID_TEXT]: nnsProposals?.length,
      ...mapEntries({
        obj: actionableSnsProposals,
        mapFn: ([canisterId, { proposals, includeBallotsByCaller }]) =>
          includeBallotsByCaller ? [canisterId, proposals.length] : undefined,
      }),
    })
  );

/** A store that contains a total count of all actionable proposals (nns + snses) */
export const actionableProposalTotalCountStore: Readable<number> = derived(
  actionableProposalCountStore,
  (map) =>
    Object.values(map).reduce((acc: number, count) => acc + (count ?? 0), 0)
);

export interface ActionableProposalSupportData {
  // We use the root canister id as the key to identify the actionable proposals support for a specific project.
  [rootCanisterId: string]: boolean | undefined;
}

/** A store that contains the project actionable proposals support state mapped by canister id (nns + snses) */
export const actionableProposalSupportedStore: Readable<ActionableProposalSupportData> =
  derived([actionableSnsProposalsStore], ([actionableSnsProposals]) => ({
    // NNS already returns ballots
    [OWN_CANISTER_ID_TEXT]: true,
    ...mapEntries({
      obj: actionableSnsProposals,
      mapFn: ([canisterId, { includeBallotsByCaller }]) => [
        canisterId,
        includeBallotsByCaller === true,
      ],
    }),
  }));

/** A store that contains sns universes with actionable support and their actionable proposals
 * in the same order as they are displayed in the UI. */
export const actionableSnsProposalsByUniverseStore: Readable<
  Array<{
    universe: Universe;
    proposals: SnsProposalData[];
  }>
> = derived(
  [selectableUniversesStore, actionableSnsProposalsStore],
  ([universes, actionableSnsProposals]) =>
    universes
      .filter(
        ({ canisterId }) =>
          actionableSnsProposals[canisterId]?.includeBallotsByCaller === true
      )
      .map((universe) => ({
        universe,
        proposals: actionableSnsProposals[universe.canisterId].proposals,
      }))
);

// TODO: rename me
/** A store that returns true when "Actionable Proposals" link needs to be displayed in the universe selector */
export const displaySelectActionableLink: Readable<boolean> = derived(
  [authSignedInStore, pageStore],
  ([isSignedIn, { path, actionable }]) =>
    path === AppPath.Proposals && isSignedIn
);

/** A store that returns true when all ‘Actionable Proposals’ have been loaded.
 */
export const actionableProposalsLoadedStore: Readable<boolean> = derived(
  [
    actionableNnsProposalsStore,
    actionableSnsProposalsStore,
    snsProjectsCommittedStore,
  ],
  ([nnsProposals, snsProposals, committedSnsProjects]) =>
    nonNullish(nnsProposals) &&
    // It is expected to have at least one SNS to cover when the projects have not yet been loaded.
    committedSnsProjects.length > 0 &&
    committedSnsProjects.length === Object.keys(snsProposals).length
);
