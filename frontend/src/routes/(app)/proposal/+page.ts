import { browser } from "$app/environment";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = (
  $event: LoadEvent
): { proposal: string | null | undefined } => {
  if (!browser) {
    return {
      proposal: undefined,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  // TODO(GIX-1071): constants for proposal
  return {
    proposal: searchParams?.get("proposal"),
  };
};
