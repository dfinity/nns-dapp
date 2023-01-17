import { browser } from "$app/environment";
import { PROJECT_PARAM } from "$lib/constants/routes.constants";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = (
  $event: LoadEvent
): { project: string | null | undefined } => {
  if (!browser) {
    return {
      project: undefined,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  return {
    project: searchParams?.get(PROJECT_PARAM),
  };
};
