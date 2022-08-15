import { writable } from "svelte/store";

export const layoutTitleStore = writable<string>("");
export const layoutBackStore = writable<(() => void) | undefined>(undefined);

/**
 * @deprecated ultimately all views should be migrated to the new "modern" UI
 */
export const layoutMainStyleStore = writable<
  "modern" | "legacy" | undefined
>(undefined);
