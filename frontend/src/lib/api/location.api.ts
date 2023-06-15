import type { CountryCode } from "$lib/types/location";

// https://geoiplookup.net/
const getLocationFromGeoIP = async (): Promise<CountryCode> => {
  const URL = "https://api.geoiplookup.net/?json=true";
  const response = await fetch(URL);

  if (!response.ok) {
    throw new Error("Failed to fetch user location from GeoIP");
  }

  const data = await response.json();
  return data.countrycode;
};

// https://api.iplocation.net/
const getLocationFromIpLocation = async (): Promise<CountryCode> => {
  const BASE_URL = "https://api.iplocation.net";
  const ipResponse = await fetch(`${BASE_URL}/?cmd=get-ip`);
  if (!ipResponse.ok) {
    throw new Error("Failed to fetch ip from IP Location");
  }
  const { ip } = await ipResponse.json();

  const response = await fetch(`${BASE_URL}/?ip=${ip}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user location from IP Location");
  }

  const data = await response.json();
  return data.country_code2;
};

/**
 * Fetches the user's country location two different services.
 *
 * @returns {CountryCode}
 */
export const queryUserCountryLocation = async (): Promise<CountryCode> => {
  try {
    return await getLocationFromGeoIP();
  } catch (_) {
    return await getLocationFromIpLocation();
  }
};
