import { writable, type Writable } from "svelte/store";

export type TransactionMemoOption = "show" | "hide";

export type TransactionMemoOptionStore = Writable<TransactionMemoOption>;

export const transactionMemoOptionStore: Writable<TransactionMemoOption> =
  writable("hide");
