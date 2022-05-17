import type { ICP } from "@dfinity/nns";
import type { Writable } from "svelte/store";
import type { Account } from "../types/account";

export interface TransactionStore {
  selectedAccount: Account | undefined;
  destinationAddress: string | undefined;
  amount: ICP | undefined;
}

export interface TransactionContext {
  store: Writable<TransactionStore>;
  next: () => void;
}

export const NEW_TRANSACTION_CONTEXT_KEY = Symbol("new-transaction");
