import type { Writable } from "svelte/store";
export type AccountType = "subAccount" | "hardwareWallet";

export interface AddAccountStore {
  type: AccountType | undefined;
  hardwareWalletName: string | undefined;
}

export interface AddAccountContext {
  store: Writable<AddAccountStore>;
  selectType: (type: AccountType) => Promise<void>;
  next: () => void;
  back: () => void;
}

export const ADD_ACCOUNT_CONTEXT_KEY = Symbol("add-account");
