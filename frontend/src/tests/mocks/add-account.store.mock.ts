import type { AddAccountStore } from "$lib/types/add-account.context";
import { writable } from "svelte/store";

export const addAccountStoreMock = writable<AddAccountStore>({
  type: undefined,
  hardwareWalletName: undefined,
});
