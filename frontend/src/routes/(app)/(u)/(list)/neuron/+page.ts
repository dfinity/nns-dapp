import { browser } from "$app/environment";
import { NEURON_PARAM } from "$lib/constants/routes.constants";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "../../../../../.svelte-kit/types/src/routes";

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

  return {
    neuron: searchParams?.get(NEURON_PARAM),
  };
};
