import { writable } from "svelte/store";
import type { TransactionStore } from "../../lib/stores/transaction.store";

export const mockTransactionStore = writable<TransactionStore>({
  selectedAccount: undefined,
  destinationAddress: undefined,
  amount: undefined,
});
