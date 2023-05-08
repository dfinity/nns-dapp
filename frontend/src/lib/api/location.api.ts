import type { CountryCode } from "$lib/types/location";

// TODO: Add to env vars?
// const TOKEN = "XXXXXX";

/**
 * Fetches the user's country location using IPInfo API
 *
 * @returns {CountryCode}
 */
export const queryUserCountryLocation = async (): Promise<CountryCode> => {
  return "CH";
  // TODO: We have two options:
  // 1. Use the IPInfo API to get the user's country location
  // 2. Use a service provided by the Boundary Nodes
  // const response = await fetch(`https://ipinfo.io/json?token=${TOKEN}`);

  // if (!response.ok) {
  //   throw new Error("Failed to fetch user location");
  // }

  // const data = await response.json();

  // return data.country;
};
