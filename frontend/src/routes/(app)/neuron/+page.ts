import { browser } from "$app/environment";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = (
  $event: LoadEvent
): { neuron: string | null | undefined } => {
  if (!browser) {
    return {
      neuron: undefined,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  // TODO(GIX-1071): constants for neuron
  return {
    neuron: searchParams?.get("neuron"),
  };
};
