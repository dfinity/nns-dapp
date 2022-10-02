import { writable } from "svelte/store";
import type { AddAccountStore } from "../../lib/types/add-account.context";

export const addAccountStoreMock = writable<AddAccountStore>({
  type: undefined,
  hardwareWalletName: undefined,
});
