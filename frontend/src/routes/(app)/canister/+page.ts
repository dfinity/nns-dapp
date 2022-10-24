import { browser } from "$app/environment";
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

  // TODO(GIX-1071): constants for canister
  return {
    canister: searchParams?.get("canister"),
  };
};
