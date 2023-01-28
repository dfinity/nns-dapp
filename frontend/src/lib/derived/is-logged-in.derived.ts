import { authStore } from "$lib/stores/auth.store";
import { derived } from "svelte/store";

export const isLoggedInStore = derived(
  authStore,
  ($store) => $store.identity !== undefined
);
