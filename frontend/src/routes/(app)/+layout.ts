import { browser } from "$app/environment";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  ACTIONABLE_PROPOSALS_PARAM,
  IMPORT_TOKEN_INDEX_ID_QUERY_PARAM,
  IMPORT_TOKEN_LEDGER_ID_QUERY_PARAM,
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
    importTokenLedgerId:
      searchParams?.get(IMPORT_TOKEN_LEDGER_ID_QUERY_PARAM) ?? undefined,
    importTokenIndexId:
      searchParams?.get(IMPORT_TOKEN_INDEX_ID_QUERY_PARAM) ?? undefined,
    // When the parameter is present but has no value in the URL(e.g., `?actionable` instead of `?actionable=yes`),
    // an empty string is returned by searchParams.
    actionable: nonNullish(searchParams?.get(ACTIONABLE_PROPOSALS_PARAM)),
  };
};
