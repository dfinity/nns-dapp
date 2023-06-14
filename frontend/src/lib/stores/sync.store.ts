import {writable} from "svelte/store";
import type {SyncState} from "$lib/types/sync";

export const syncStore = writable<SyncState>("idle");