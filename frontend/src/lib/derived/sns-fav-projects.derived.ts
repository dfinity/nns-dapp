import { nonNullish } from "@dfinity/utils";
import { derived } from "svelte/store";
import { snsFavProjectsStore } from "../stores/sns-fav-projects.store";

// This store is used to determine if the favorite projects controls are available.
// - fav projects are loaded
// - at least one project is set as favorite (otherwise nothing to filter)
export const snsFavProjectsToggleVisibleStore = derived(
  snsFavProjectsStore,
  ($snsFavProjectsStore) =>
    nonNullish($snsFavProjectsStore.rootCanisterIds) &&
    $snsFavProjectsStore.rootCanisterIds.length > 0
);
