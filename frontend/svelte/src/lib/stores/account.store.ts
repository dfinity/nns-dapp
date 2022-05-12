import type { Writable } from "svelte/store";
import type { Transaction } from "../canisters/nns-dapp/nns-dapp.types";
import type { Account } from "../types/account";

export interface AccountStore {
  accountIdentifier: string | undefined;
  account: Account | undefined;
  transactions: Transaction[] | undefined;
}

export type AccountContext = Writable<AccountStore>;

export const ACCOUNT_CONTEXT_KEY = Symbol("account");
