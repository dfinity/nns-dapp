import { Principal } from "@dfinity/principal";
import { derived } from "svelte/store";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { routeStore } from "$lib/stores/route.store";
import { getContextFromPath } from "$lib/utils/app-path.utils";
import { isNnsProject } from "$lib/utils/projects.utils";

/**
 * In Neurons or ultimately in Voting screen, user can select the "context" - e.g. display Neurons of Nns or a particular Sns
 * This "context" is represented in the path of the URL: `/#/u/<some-context>/...`
 * The store reads the routeStore and returns the context.
 * It defaults to NNS (OWN_CANISTER_ID) if the path is not a context path.
 */
export const snsProjectSelectedStore = derived([routeStore], ([{ path }]) => {
  const maybeContextId = getContextFromPath(path);
  if (maybeContextId !== undefined) {
    try {
      return Principal.fromText(maybeContextId);
    } catch (error: unknown) {
      // Add execeptions, maybe bitcoin wallet?
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
export const snsOnlyProjectStore = derived(
  snsProjectSelectedStore,
  ($snsProjectSelectedStore: Principal) =>
    isNnsProject($snsProjectSelectedStore)
      ? undefined
      : $snsProjectSelectedStore
);
