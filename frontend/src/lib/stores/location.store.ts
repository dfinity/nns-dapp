import type { CountryCode } from "$lib/types/location";
import { writable } from "svelte/store";

export const locationStore = writable<CountryCode | undefined>(undefined);
