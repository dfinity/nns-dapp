import { page } from "$app/stores";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import type { Page as PageType } from "@sveltejs/kit";
import { derived, type Readable } from "svelte/store";

/**
 * Derived stores which contain the information we need for the pages with strong types.
 * Their information are derived from the $page store of SvelteKit which is automatically build with the +layout.ts `load` functions.
 */

export interface Page {
  universe: string;
  path: AppPath | null;
}

// TODO(GIX-1071): test + constant for (app)
const pathForRouteId = (routeId: string): AppPath => {
  const index = Object.values(AppPath).indexOf(
    routeId.replace("(app)", "") as unknown as AppPath
  );
  const key = Object.keys(AppPath)[index];

  // TODO: solve eslint type checking
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-line
  return AppPath[key as keyof AppPath];
};

export const pageStore = derived<Readable<PageType>, Page>(
  page,
  ({ data: { universe }, routeId }) => ({
    universe: universe ?? OWN_CANISTER_ID_TEXT,
    path: routeId ? pathForRouteId(routeId) : null,
  })
);
