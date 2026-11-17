import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { authStore } from "$lib/stores/auth.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import type { Hotkey } from "$lib/types/hotkeys";
import { getHotkeys } from "$lib/utils/hotkeys.utils";
import { createUniverse } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";

/**
 * The hotkeys of the NNS neurons and of the neurons of the committed SNS projects.
 * The principal of the user is not in the list.
 */
export const hotkeysStore: Readable<Hotkey[]> = derived(
  [
    neuronsStore,
    snsNeuronsStore,
    nnsUniverseStore,
    snsProjectsCommittedStore,
    authStore,
  ],
  ([nnsNeurons, snsNeurons, nnsUniverse, snsProjects, { identity }]) =>
    getHotkeys({
      nnsNeurons: nnsNeurons.neurons ?? [],
      snsNeurons,
      universes: [
        nnsUniverse,
        ...snsProjects.map(({ summary }) => createUniverse(summary)),
      ],
      excludedPrincipal: identity?.getPrincipal().toText(),
    })
);
