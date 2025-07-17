import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type SnsFavProjectsVisibilityData = "all" | "fav";

export type SnsFavProjectsVisibilityStore =
  Writable<SnsFavProjectsVisibilityData>;

export const snsFavProjectsVisibilityStore =
  writableStored<SnsFavProjectsVisibilityData>({
    key: StoreLocalStorageKey.SnsFavProjectsOnly,
    defaultValue: "all",
  });
