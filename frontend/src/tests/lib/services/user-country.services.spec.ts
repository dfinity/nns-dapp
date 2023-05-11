import * as locationApi from "$lib/api/location.api";
import { loadUserCountry } from "$lib/services/user-country.services";
import { userCountryStore } from "$lib/stores/user-country.store";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { get } from "svelte/store";

jest.mock("$lib/api/location.api");

describe("location services", () => {
  blockAllCallsTo(["$lib/api/location.api"]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loadUserLocation", () => {
    it("should set the location store to api response", async () => {
      expect(get(userCountryStore)).toBe("not loaded");

      const countryCode = "CH";
      jest
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockResolvedValue(countryCode);

      await loadUserCountry();

      expect(get(userCountryStore)).toEqual({ isoCode: countryCode });
    });

    it("should not call api if location store is already set", async () => {
      const countryCode = "CH";
      const apiFn = jest
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockResolvedValue(countryCode);
      userCountryStore.set({ isoCode: countryCode });

      await loadUserCountry();

      expect(apiFn).not.toHaveBeenCalled();
    });
  });
});
