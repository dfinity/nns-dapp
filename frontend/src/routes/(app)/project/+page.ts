import { browser } from "$app/environment";
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

  // TODO(GIX-1071): constants for project
  return {
    project: searchParams?.get("project"),
  };
};
