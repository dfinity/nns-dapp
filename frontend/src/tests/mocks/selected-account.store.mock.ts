import { writable } from "svelte/store";
import type { SelectedAccountStore } from "../../lib/types/selected-account.context";
import { mockMainAccount } from "./accounts.store.mock";

export const mockSelectedAccountStore = writable<SelectedAccountStore>({
  account: mockMainAccount,
  transactions: undefined,
});
