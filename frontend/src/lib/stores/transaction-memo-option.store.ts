import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { writableStored } from "$lib/stores/writable-stored";
import type { Writable } from "svelte/store";

export type TransactionMemoOption = "show" | "hide";

export type TransactionMemoOptionStore = Writable<TransactionMemoOption>;

export const transactionMemoOptionStore =
  writableStored<TransactionMemoOption>({
    key: StoreLocalStorageKey.TransactionMemoOption,
    defaultValue: "hide",
  });


