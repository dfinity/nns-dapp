import { writable } from "svelte/store";
import type { Account } from "../types/account";

export interface AccountsStore {
  main: Account | undefined;
}

/**
 * A store that contains the account information.
 */
export const accountsStore = writable<AccountsStore>({
  main: undefined,
});
