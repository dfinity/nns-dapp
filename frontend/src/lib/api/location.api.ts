// TODO: Use a DFINITY token

import type { CountryCode } from "$lib/types/location";

// TODO: Add to env vars?
// TODO: HIDE?
// TODO: This is visible in the Dev Tools also. Better to use a BN endpoint?
const TOKEN = "940f2870bd8b95";

/**
 * Fetches the user's country location using IPInfo API
 *
 * @returns {CountryCode}
 */
export const getUserCountryLocation = async (): Promise<CountryCode> => {
  const response = await fetch(`https://ipinfo.io/json?token=${TOKEN}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user location");
  }

  const data = await response.json();

  return data.country;
};
