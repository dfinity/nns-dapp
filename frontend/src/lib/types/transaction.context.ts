import type { ICP } from "@dfinity/nns";
import type { Writable } from "svelte/store";
import type { Account } from "./account";

export interface TransactionStore {
  selectedAccount: Account | undefined;
  destinationAddress: string | undefined;
  amount: ICP | undefined;
}

export type NewTransaction = {
  sourceAccount: Account;
  destinationAddress: string;
  amount: number;
};

export interface TransactionContext {
  store: Writable<TransactionStore>;
  next: () => void;
  back: () => void;
  onTransactionComplete?: () => Promise<void>;
  validateTransaction?: (store: TransactionStore) => boolean;
}

export const NEW_TRANSACTION_CONTEXT_KEY = Symbol("new-transaction");
