import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type HideZeroBalancesMode = "show" | "hide";

export type HideZeroBalancesStore = Writable<HideZeroBalancesMode>;

export const hideZeroBalancesStore = writableStored<HideZeroBalancesMode>({
  key: StoreLocalStorageKey.HideZeroBalances,
  defaultValue: "show",
});
