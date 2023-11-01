import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { derived } from "svelte/store";

export const jsonRepresentationModeStore = derived(
  [jsonRepresentationStore],
  ([{ mode }]) => mode
);
