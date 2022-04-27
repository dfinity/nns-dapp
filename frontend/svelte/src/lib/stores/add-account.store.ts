import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export type AccountType = "subAccount" | "hardwareWallet";

export interface AddAccountStore {
  type: AccountType | undefined;
  hardwareWalletName: string | undefined;
}

export interface AddAccountContext {
  store: Writable<AddAccountStore>;
  selectType: (type: AccountType) => Promise<void>;
  next: () => void;
}

export const ADD_ACCOUNT_CONTEXT_KEY = Symbol("add-account");

/**
 * A store that contains the type of account that will be added (subaccount or hardware wallet) and addition data that can be used across multiple steps of the wizard.
 *
 * This store is used in a scoped way in the <AddAccountModal />
 *
 */
export const addAccountStore = writable<AddAccountStore>({
  type: undefined,
  hardwareWalletName: undefined,
});
