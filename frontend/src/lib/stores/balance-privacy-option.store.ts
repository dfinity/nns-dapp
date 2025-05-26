import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type BalancePrivacyOptionData = "show" | "hide";

export type BalancePrivacyOptionStore = Writable<BalancePrivacyOptionData>;

export const balancePrivacyOptionStore =
  writableStored<BalancePrivacyOptionData>({
    key: StoreLocalStorageKey.BalancePrivacyOption,
    defaultValue: "show",
  });
