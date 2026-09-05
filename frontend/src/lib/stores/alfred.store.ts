import { writable, type Writable } from "svelte/store";

export type AlfredVisibleStore = Writable<boolean>;

// The command palette opens from the Ctrl+K shortcut and from the header
// search button. The flag lives in a store so that both triggers reach the
// single <Alfred /> instance that the app layout mounts.
// The value is never persisted. The palette always starts closed.
export const alfredVisibleStore: AlfredVisibleStore = writable<boolean>(false);
