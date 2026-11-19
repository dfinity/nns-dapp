import { writable } from "svelte/store";

export const layoutBottomOffset = writable<number>(0);
export const layoutMenuOpen = writable<boolean>(false);
export const layoutContentScrollY = writable<"hidden" | "auto">("auto");
export const layoutContentTopHidden = writable<boolean>(false);
