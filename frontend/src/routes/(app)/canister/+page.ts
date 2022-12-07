import { browser } from "$app/environment";
import { CANISTER_PARAM } from "$lib/constants/routes.constants";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = (
  $event: LoadEvent
): { canister: string | null | undefined } => {
  if (!browser) {
    return {
      canister: undefined,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  return {
    canister: searchParams?.get(CANISTER_PARAM),
  };
};
