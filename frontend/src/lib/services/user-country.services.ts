import { queryUserCountryLocation } from "$lib/api/location.api";
import { userCountryStore } from "$lib/stores/user-country.store";
import { get } from "svelte/store";

export const loadUserCountry = async () => {
  try {
    if (get(userCountryStore) !== undefined) {
      return;
    }
    const countryCode = await queryUserCountryLocation();
    userCountryStore.set(countryCode);
  } catch (e: unknown) {
    // TODO: Implement error handling
    console.error(e);
  }
};
