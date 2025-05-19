import { authSignedInStore } from "$lib/derived/auth.derived";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { derived } from "svelte/store";

export const isBalancePrivacyOptionStore = derived(
  [balancePrivacyOptionStore, authSignedInStore],
  ([$balancePrivacyOptionStore, isSignedIn]) =>
    $balancePrivacyOptionStore === "hide" && isSignedIn
);
