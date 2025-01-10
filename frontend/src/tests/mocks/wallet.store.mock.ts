import type { WalletStore } from "$lib/types/wallet.context";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { writable } from "svelte/store";

export const mockWalletStore = writable<WalletStore>({
  account: mockMainAccount,
  neurons: [],
});
