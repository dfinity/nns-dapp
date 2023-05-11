import type { Country } from "$lib/types/location";
import { derived, writable } from "svelte/store";

/**
 * - Loading: undefined
 * - Error: Error
 * - Success: Country
 */
type UserCountryStore = Country | Error | undefined;

// Stores the user's country code
export const userCountryStore = writable<UserCountryStore>(undefined);

export const isUserCountryLoadingStore = derived(
  userCountryStore,
  ($userCountry) => $userCountry === undefined
);
export const isUserCountryErrorStore = derived(
  userCountryStore,
  ($userCountry) => $userCountry instanceof Error
);
