import { browser } from "$app/environment";
import type { NeuronId } from "@dfinity/nns";
import type { LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = (
  $event: LoadEvent
): { neuron: NeuronId | null | undefined } => {
  if (!browser) {
    return {
      neuron: undefined,
    };
  }

  const {
    url: { searchParams },
  } = $event;

  // TODO(GIX-1071): constants for neuron
  try {
    const id = searchParams?.get("neuron");
    return {
      neuron: id ? BigInt(id) : null,
    };
  } catch (_err: unknown) {
    return {
      neuron: undefined,
    };
  }
};
