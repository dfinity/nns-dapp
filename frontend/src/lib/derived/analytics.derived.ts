import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
import { universesStore } from "$lib/derived/universes.derived";
import { slugifyTitle } from "$lib/utils/analytics.utils";
import { derived } from "svelte/store";

/**
 * This derived store creates a mapping of projects and universe canister IDs to slugs.
 * As the universeStore contains some of the projects, we ensure that a universe doesn't already exist on the map before adding it.
 */
export const projectSlugMapStore = derived(
  [universesStore, snsProjectsActivePadStore],
  ([$universesStore, $snsProjectsActivePadStore]) => {
    const universeToProjectSlugMap = new Map<string, string>();

    $snsProjectsActivePadStore.forEach((project) => {
      universeToProjectSlugMap.set(
        project.rootCanisterId.toText(),
        slugifyTitle(project.summary.metadata.name)
      );
    });

    $universesStore.forEach((universe) => {
      if (universeToProjectSlugMap.has(universe.canisterId)) return;

      universeToProjectSlugMap.set(
        universe.canisterId,
        slugifyTitle(universe.title)
      );
    });

    return universeToProjectSlugMap;
  }
);
