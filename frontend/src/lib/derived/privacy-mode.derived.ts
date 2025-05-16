import { authSignedInStore } from "$lib/derived/auth.derived";
import { balancesVisibility } from "$lib/stores/balances-visibility.store";
import { derived } from "svelte/store";

export const isPrivacyModeStore = derived(
  [balancesVisibility, authSignedInStore],
  ([$balancesVisibility, isSignedIn]) =>
    $balancesVisibility === "hide" && isSignedIn
);
