import type { Writable } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "./account";

/**
 * A store that contains selected account and it's transactions.
 */
export interface SelectedAccountStore {
  account: Account | undefined;
  transactions: Transaction[] | undefined;
}

export interface SelectedAccountContext {
  store: Writable<SelectedAccountStore>;
}

export const SELECTED_ACCOUNT_CONTEXT_KEY = Symbol("selected-account");
