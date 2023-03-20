import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import {
  snsProjectsCommittedStore,
  snsProjectsStore,
  type SnsFullProject,
} from "$lib/derived/sns/sns-projects.derived";
import { isUniverseCkBTC, isUniverseNns } from "$lib/utils/universe.utils";
import type { Principal } from "@dfinity/principal";
import { derived, type Readable } from "svelte/store";

/**
 * Returns undefined if the selected project is NNS or ckBTC, otherwise returns the selected project principal.
 */
export const snsOnlyProjectStore = derived<
  Readable<Principal>,
  Principal | undefined
>(selectedUniverseIdStore, ($selectedUniverseIdStore: Principal) =>
  isUniverseNns($selectedUniverseIdStore) ||
  isUniverseCkBTC($selectedUniverseIdStore)
    ? undefined
    : $selectedUniverseIdStore
);

export const snsProjectSelectedStore: Readable<SnsFullProject | undefined> =
  derived(
    [selectedUniverseIdStore, snsProjectsStore],
    ([$selectedUniverseIdStore, $projectsStore]) =>
      $projectsStore.find(
        ({ rootCanisterId }) =>
          rootCanisterId.toText() === $selectedUniverseIdStore.toText()
      )
  );

export const snsCommittedProjectSelectedStore: Readable<
  SnsFullProject | undefined
> = derived(
  [selectedUniverseIdStore, snsProjectsCommittedStore],
  ([$selectedUniverseIdStore, $projectsStore]) =>
    $projectsStore.find(
      ({ rootCanisterId }) =>
        rootCanisterId.toText() === $selectedUniverseIdStore.toText()
    )
);
