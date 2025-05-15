import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type BalancePrivacyOption = "show" | "hide";

export type BalancePrivacyOptionStore = Writable<BalancePrivacyOption>;

export const balancesVisibility = writableStored<BalancePrivacyOption>({
  key: StoreLocalStorageKey.BalancePrivacyOption,
  defaultValue: "show",
});
