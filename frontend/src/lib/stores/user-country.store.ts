import { NOT_LOADED } from "$lib/constants/stores.constants";
import type { Country } from "$lib/types/location";
import type { StoreData } from "$lib/types/store";
import { derived, writable } from "svelte/store";

type UserCountryStore = StoreData<Country>;

// Stores the user's country code
export const userCountryStore = writable<UserCountryStore>(NOT_LOADED);

export const isUserCountryLoadedStore = derived(
  userCountryStore,
  ($userCountry) => $userCountry !== NOT_LOADED
);
export const isUserCountryErrorStore = derived(
  userCountryStore,
  ($userCountry) => $userCountry instanceof Error
);
