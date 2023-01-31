import { authStore } from "$lib/stores/auth.store";
import { isSignedIn } from "$lib/utils/auth.utils";
import { derived } from "svelte/store";

export const isLoggedInStore = derived(authStore, ($store) =>
  isSignedIn($store.identity)
);
