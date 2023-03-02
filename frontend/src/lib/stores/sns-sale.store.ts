import { writable } from "svelte/store";

export const saleInProgress = writable<boolean>(false);
