import type { Writable } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "../types/account";

export interface TransactionsStore {
  accountIdentifier: string | undefined;
  account: Account | undefined;
  transactions: Transaction[] | undefined;
}

export type TransactionsContext = Writable<TransactionsStore>;

export const TRANSACTIONS_CONTEXT_KEY = Symbol("transactions");
