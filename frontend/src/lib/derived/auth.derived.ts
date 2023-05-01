import { authStore } from "$lib/stores/auth.store";
import { isSignedIn } from "$lib/utils/auth.utils";
import { derived, type Readable } from "svelte/store";

export const authSignedInStore: Readable<boolean> = derived(
  authStore,
  ({ identity }) => isSignedIn(identity)
);
