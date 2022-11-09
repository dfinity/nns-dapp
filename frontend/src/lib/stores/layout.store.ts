import { writable } from "svelte/store";

export const layoutTitleStore = writable<string>("");

// TODO(GIX-1071): can be inlined in each +layout.svelte
// @deprecated
export const layoutBackStore = writable<(() => Promise<void>) | undefined>(
  undefined
);

// A store used to enable all sign-in buttons displayed on pages as enabled only once the app has been loaded
// Once JS is loaded, auth has been synced and message listener are ready
export const layoutAuthReady = writable<boolean>(false);
