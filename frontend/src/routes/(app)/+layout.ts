import { browser } from "$app/environment";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { Page } from "$lib/stores/page.store";
import type { LoadEvent } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = ($event: LoadEvent): Partial<Page> => {
  if (!browser) {
    return {
      universe: OWN_CANISTER_ID_TEXT,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  // TODO(GIX-1071): constants for u
  return {
    universe: searchParams?.get("u") ?? undefined,
  };
};
