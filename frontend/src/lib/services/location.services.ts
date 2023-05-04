import { queryUserCountryLocation } from "$lib/api/location.api";
import { locationStore } from "$lib/stores/location.store";
import { get } from "svelte/store";

export const loadUserLocation = async () => {
  try {
    if (get(locationStore) !== undefined) {
      return;
    }
    const countryCode = await queryUserCountryLocation();
    locationStore.set(countryCode);
  } catch (e: unknown) {
    // TODO: Implement error handling
    console.error(e);
  }
};
