import { page } from "$app/stores";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { AppPath } from "$lib/constants/routes.constants";
import { pathForRouteId } from "$lib/utils/page.utils";
import type { Page as PageType } from "@sveltejs/kit";
import { derived, type Readable } from "svelte/store";

/**
 * Derived stores which contain the information we need for the pages with strong types.
 * Their information are derived from the $page store of SvelteKit which is automatically build with the +layout.ts `load` functions.
 */

export interface Page {
  universe: string;
  actionable: boolean;
  path: AppPath | null;
}

export const pageStore = derived<Readable<PageType>, Page>(
  page,
  ({ data, route: { id: routeId } }) => {
    const { universe, actionable } = data;
    return {
      universe: universe ?? OWN_CANISTER_ID_TEXT,
      actionable,
      path: routeId ? pathForRouteId(routeId) : null,
    };
  }
);
