import type { CountryCode } from "$lib/types/location";
import { writable } from "svelte/store";

// Stores the user's country code
export const userCountryStore = writable<CountryCode | undefined>(undefined);
