import { browser } from "$app/environment";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  ACTIONABLE_PARAM,
  UNIVERSE_PARAM,
} from "$lib/constants/routes.constants";
import type { Page } from "$lib/derived/page.derived";
import { nonNullish } from "@dfinity/utils";
import type { LoadEvent } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = ($event: LoadEvent): Partial<Page> => {
  if (!browser) {
    return {
      universe: OWN_CANISTER_ID_TEXT,
      actionable: false,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  return {
    universe: searchParams?.get(UNIVERSE_PARAM) ?? undefined,
    actionable: nonNullish(searchParams?.get(ACTIONABLE_PARAM)),
  };
};
