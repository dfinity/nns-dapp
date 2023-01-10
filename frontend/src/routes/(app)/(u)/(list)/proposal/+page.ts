import { browser } from "$app/environment";
import { PROPOSAL_PARAM } from "$lib/constants/routes.constants";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "../../../../../.svelte-kit/types/src/routes";

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

  return {
    proposal: searchParams?.get(PROPOSAL_PARAM),
  };
};
