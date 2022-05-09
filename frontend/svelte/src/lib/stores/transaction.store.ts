import type { ICP } from "@dfinity/nns";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import type { Account } from "../types/account";

export interface TransactionStore {
  selectedAccount: Account | undefined;
  destinationAddress: string | undefined;
  amount: ICP | undefined;
}

export interface TransactionContext {
  store: Writable<TransactionStore>;
  selectSource: (selectedAccount: Account) => Promise<void>;
  next: () => void;
}

export const NEW_TRANSACTION_CONTEXT_KEY = Symbol("new-transaction");

/**
 * A store that contains transaction information - i.e. information that are used to issue a new transaction between accounts.
 * For example: transferring ICP from main- to a subaccount
 *
 * This store is used in a scoped way in the <NewTransactionModal />
 *
 */
export const transactionStore = writable<TransactionStore>({
  selectedAccount: undefined,
  destinationAddress: undefined,
  amount: undefined,
});
