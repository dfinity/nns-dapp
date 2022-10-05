import type { TransactionStore } from "$lib/types/transaction.context";
import { writable } from "svelte/store";

export const mockTransactionStore = writable<TransactionStore>({
  selectedAccount: undefined,
  destinationAddress: undefined,
  amount: undefined,
});
