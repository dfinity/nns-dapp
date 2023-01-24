import {
  CKBTC_LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { ENABLE_CKBTC_LEDGER } from "$lib/constants/environment.constants";
import { pageStore } from "$lib/derived/page.derived";
import {
  NNS_UNIVERSE,
  selectableUniverses,
} from "$lib/derived/selectable-universes.derived";
import type { Universe } from "$lib/types/universe";
import { isNnsProject } from "$lib/utils/projects.utils";
import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

/**
 * In Neurons or ultimately in Voting screen, user can select the "context" - e.g. display Neurons of Nns or a particular Sns
 * This "context" is represented in the path of the URL: `/#/u/<some-context>/...`
 * The store reads the routeStore and returns the context.
 * It defaults to NNS (OWN_CANISTER_ID) if the path is not a context path.
 */
export const selectedUniverseIdStore: Readable<Principal> = derived(
  pageStore,
  ({ universe }) => {
    if (
      ![
        null,
        undefined,
        OWN_CANISTER_ID_TEXT,
        CKBTC_LEDGER_CANISTER_ID.toText(),
      ].includes(universe)
    ) {
      try {
        return Principal.fromText(universe);
      } catch (error: unknown) {
        // Ignore error as we redirect to default Nns or ckBTC
      }
    }

    // TODO: once ckBTC enabled any checks in this function relying on CKBTC_LEDGER_CANISTER_ID shall be removed and we can just parse the principal as above
    if (ENABLE_CKBTC_LEDGER && CKBTC_LEDGER_CANISTER_ID.toText() === universe) {
      return CKBTC_LEDGER_CANISTER_ID;
    }

    // Consider NNS as default project
    return OWN_CANISTER_ID;
  }
);

/**
 * Is the selected universe Nns?
 */
export const isNnsUniverseStore = derived(
  selectedUniverseIdStore,
  ($selectedProjectId: Principal) => isNnsProject($selectedProjectId)
);

export const selectedUniverseStore: Readable<Universe> = derived(
  [selectedUniverseIdStore, selectableUniverses],
  ([$selectedUniverseIdStore, $selectableUniverses]) =>
    $selectableUniverses?.find(
      ({ canisterId }) => canisterId === $selectedUniverseIdStore.toText()
    ) ?? NNS_UNIVERSE
);
