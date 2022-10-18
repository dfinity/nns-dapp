import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { routesStore } from "$lib/stores/routes.stores";
import { isNnsProject } from "$lib/utils/projects.utils";
import { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

/**
 * In Neurons or ultimately in Voting screen, user can select the "context" - e.g. display Neurons of Nns or a particular Sns
 * This "context" is represented in the path of the URL: `/#/u/<some-context>/...`
 * The store reads the routeStore and returns the context.
 * It defaults to NNS (OWN_CANISTER_ID) if the path is not a context path.
 */
export const snsProjectSelectedStore = derived(routesStore, ({ universe }) => {
  if (![null, undefined, OWN_CANISTER_ID_TEXT].includes(universe)) {
    try {
      return Principal.fromText(universe);
    } catch (error: unknown) {
      // Add exceptions, maybe bitcoin wallet?
    }
  }
  // Consider NNS as default project
  return OWN_CANISTER_ID;
});

/***
 * Is the selected project (universe) Nns?
 */
export const isNnsProjectStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore: Principal) =>
    isNnsProject($snsProjectSelectedStore)
);

/***
 * Returns undefined if the selected project is NNS, otherwise returns the selected project principal.
 */
export const snsOnlyProjectStore = derived<
  Readable<Principal>,
  Principal | undefined
>(snsProjectSelectedStore, ($snsProjectSelectedStore: Principal) =>
  isNnsProject($snsProjectSelectedStore) ? undefined : $snsProjectSelectedStore
);
