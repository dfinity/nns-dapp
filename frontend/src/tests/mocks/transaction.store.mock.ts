import { writable } from "svelte/store";
import type { TransactionStore } from "../../lib/types/transaction.context";

export const mockTransactionStore = writable<TransactionStore>({
  selectedAccount: undefined,
  destinationAddress: undefined,
  amount: undefined,
});
