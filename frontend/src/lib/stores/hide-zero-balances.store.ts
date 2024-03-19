import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import type { Writable } from "svelte/store";
import { writableStored } from "./writable-stored";

export type HideZeroBalancesMode = "show" | "hide";

export type HideZeroBalancesStore = Writable<HideZeroBalancesMode>;

export const hideZeroBalancesStore = writableStored<HideZeroBalancesMode>({
  key: StoreLocalStorageKey.HideZeroBalances,
  defaultValue: "show",
});
