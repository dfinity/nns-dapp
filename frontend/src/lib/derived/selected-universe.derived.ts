import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { pageStore } from "$lib/derived/page.derived";
import {
  NNS_UNIVERSE,
  selectableUniversesStore,
} from "$lib/derived/selectable-universes.derived";
import type { Universe } from "$lib/types/universe";
import { isUniverseCkBTC, isUniverseNns } from "$lib/utils/universe.utils";
import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

/**
 * In Neurons or ultimately in Voting screen, user can select the "universe" - e.g. display Neurons of Nns or a particular Sns
 * This "universe" is represented in the path of the URL: `/accounts/?u=<a-canister-id>...`
 * The store reads the routeStore and returns the context.
 * It defaults to NNS (OWN_CANISTER_ID) if the path is not a context path.
 */
const pageUniverseIdStore: Readable<Principal> = derived(
  pageStore,
  ({ universe }) => {
    if (![null, undefined, OWN_CANISTER_ID_TEXT].includes(universe)) {
      try {
        return Principal.fromText(universe);
      } catch (error: unknown) {
        // Ignore error as we redirect to default Nns or ckBTC
      }
    }

    // Consider NNS as default project
    return OWN_CANISTER_ID;
  }
);

export const selectedUniverseStore: Readable<Universe> = derived(
  [pageUniverseIdStore, selectableUniversesStore],
  ([$pageUniverseIdStore, $selectableUniverses]) =>
    $selectableUniverses?.find(
      ({ canisterId }) => canisterId === $pageUniverseIdStore.toText()
    ) ?? NNS_UNIVERSE
);

export const selectedUniverseIdStore: Readable<Principal> = derived<
  Readable<Universe>,
  Principal
>(selectedUniverseStore, (universe: Universe) =>
  Principal.fromText(universe.canisterId)
);

/**
 * Is the selected universe Nns?
 */
export const isNnsUniverseStore = derived(
  selectedUniverseIdStore,
  ($selectedProjectId: Principal) => isUniverseNns($selectedProjectId)
);

/**
 * Is the selected universe ckBTC?
 */
export const isCkBTCUniverseStore = derived(
  selectedUniverseIdStore,
  ($selectedProjectId: Principal) => isUniverseCkBTC($selectedProjectId)
);
