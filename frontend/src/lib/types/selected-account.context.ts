import type { Writable } from "svelte/store";
import type { Account } from "./account";

/**
 * A store that contains selected account and it's transactions.
 */
export interface SelectedAccountStore {
  account: Account | undefined;
}

export interface SelectedAccountContext {
  store: Writable<SelectedAccountStore>;
}

export const SELECTED_ACCOUNT_CONTEXT_KEY = Symbol("selected-account");
