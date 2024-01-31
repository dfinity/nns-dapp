import { pageStore, type Page } from "$lib/derived/page.derived";
import {
  icrcCanistersStore,
  type IcrcCanistersStore,
  type IcrcCanistersStoreData,
} from "$lib/stores/icrc-canisters.store";
import type { Universe } from "$lib/types/universe";
import { isAllTokensPath, isUniverseCkBTC } from "$lib/utils/universe.utils";
import { isNullish } from "@dfinity/utils";
import { derived, type Readable } from "svelte/store";
import { universesStore } from "./universes.derived";

export const selectableUniversesStore = derived<
  [Readable<Universe[]>, Readable<Page>, IcrcCanistersStore],
  Universe[]
>(
  [universesStore, pageStore, icrcCanistersStore],
  ([universes, page, icrcCanisters]: [
    Universe[],
    Page,
    IcrcCanistersStoreData,
  ]) =>
    // Non-governance paths show all universes
    // The rest show all universes except for ckBTC, and ICRC Tokens
    universes.filter(
      ({ canisterId }) =>
        isAllTokensPath(page) ||
        (!isUniverseCkBTC(canisterId) && isNullish(icrcCanisters[canisterId]))
    )
);
