import { writable } from "svelte/store";

export const layoutTitleStore = writable<string>("");
export const layoutBackStore = writable<() => void | undefined>(undefined);
