import { pageStore, type Page } from "$lib/derived/page.derived";
import type { Universe } from "$lib/types/universe";
import { isUniverseCkBTC, pathSupportsCkBTC } from "$lib/utils/universe.utils";
import { derived, type Readable } from "svelte/store";
import { universesStore } from "./universes.derived";

export const selectableUniversesStore = derived<
  [Readable<Universe[]>, Readable<Page>],
  Universe[]
>([universesStore, pageStore], ([universes, page]: [Universe[], Page]) =>
  universes.filter(
    ({ canisterId }) => pathSupportsCkBTC(page) || !isUniverseCkBTC(canisterId)
  )
);
