import { queryUserCountryLocation } from "$lib/api/location.api";
import { userCountryStore } from "$lib/stores/user-country.store";
import { get } from "svelte/store";

export const loadUserCountry = async () => {
  try {
    if (get(userCountryStore) !== undefined) {
      return;
    }
    const countryCode = await queryUserCountryLocation();
    userCountryStore.set({ isoCode: countryCode });
  } catch (e: unknown) {
    // Print the error to the console for debugging purposes
    console.error(e);
    userCountryStore.set(new Error("Error loading user country"));
  }
};
