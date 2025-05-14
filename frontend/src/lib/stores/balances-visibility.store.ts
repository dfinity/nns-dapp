import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type BalancesVisibility = "show" | "hide";

export type BalancesVisibilityStore = Writable<BalancesVisibility>;

export const balancesVisibility = writableStored<BalancesVisibility>({
  key: StoreLocalStorageKey.BalancesVisibility,
  defaultValue: "show",
});
