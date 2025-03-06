import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type HideZeroNeuronsModeData = "show" | "hide";

export type HideZeroNeuronsStore = Writable<HideZeroNeuronsModeData>;

export const hideZeroNeuronsStore = writableStored<HideZeroNeuronsModeData>({
  key: StoreLocalStorageKey.HideZeroNeurons,
  defaultValue: "show",
});
