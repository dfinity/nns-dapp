import { page } from "$app/stores";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Page as PageType } from "@sveltejs/kit";
import { derived, type Readable } from "svelte/store";

/**
 * Derived stores which contain the information we need for the pages with strong types.
 * Their information are derived from the $page store of SvelteKit which is automatically build with the +layout.ts `load` functions.
 */

export interface Page {
  universe: string;
}

export const pageStore = derived<Readable<PageType>, Page>(
  page,
  ({ data: { universe } }) => ({
    universe: universe ?? OWN_CANISTER_ID_TEXT,
  })
);
