import type { AppPath } from "$lib/constants/routes.constants";
import { writable } from "svelte/store";

export const referrerPathStore = writable<AppPath | undefined>(undefined);
