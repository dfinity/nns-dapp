import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type HideZeroNeuronsMode = "show" | "hide";

export type HideZeroNeuronsStore = Writable<HideZeroNeuronsMode>;

export const hideZeroNeuronsStore = writableStored<HideZeroNeuronsMode>({
  key: StoreLocalStorageKey.HideZeroNeurons,
  defaultValue: "show",
});
