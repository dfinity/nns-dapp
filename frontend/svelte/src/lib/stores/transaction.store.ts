import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { Account } from "../types/account";

export interface TransactionStore {
  selectedAccount: Account | undefined;
  destinationAddress: string | undefined;
}

export interface TransactionContext {
  store: Writable<TransactionStore>;
  next: () => void;
}

export const NEW_TRANSACTION_CONTEXT_KEY = "new-transaction";

/**
 * A store that contain transaction information - i.e. information that are use to issue a new transaction between accounts.
 * For example: transfering ICP from main- to a subaccount
 *
 * This store is used in a scoped way in the <NewTransactionModal />
 *
 */
export const transactionStore = writable<TransactionStore>({
  selectedAccount: undefined,
  destinationAddress: undefined,
});
