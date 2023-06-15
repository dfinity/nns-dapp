import type { Country } from "$lib/types/location";
import { derived, writable } from "svelte/store";
import type { StoreData } from "../types/store";

/**
 * - Not Loaded: "not loaded"
 * - Error: Error
 * - Success: Country
 */
type UserCountryStore = StoreData<Country>;

// Stores the user's country code
export const userCountryStore = writable<UserCountryStore>("not loaded");

export const isUserCountryLoadedStore = derived(
  userCountryStore,
  ($userCountry) => $userCountry !== "not loaded"
);
export const isUserCountryErrorStore = derived(
  userCountryStore,
  ($userCountry) => $userCountry instanceof Error
);
