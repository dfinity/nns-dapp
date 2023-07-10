import * as locationApi from "$lib/api/location.api";
import { NOT_LOADED } from "$lib/constants/stores.constants";
import { loadUserCountry } from "$lib/services/user-country.services";
import { userCountryStore } from "$lib/stores/user-country.store";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { get } from "svelte/store";

jest.mock("$lib/api/location.api");

describe("location services", () => {
  blockAllCallsTo(["$lib/api/location.api"]);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  describe("loadUserLocation", () => {
    beforeEach(() => {
      userCountryStore.set(NOT_LOADED);
    });
    it("should set the location store to api response", async () => {
      expect(get(userCountryStore)).toBe(NOT_LOADED);

      const countryCode = "CH";
      jest
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockResolvedValue(countryCode);

      await loadUserCountry();

      expect(get(userCountryStore)).toEqual({ isoCode: countryCode });
    });

    it("should set the location store to error if api fails", async () => {
      expect(get(userCountryStore)).toBe(NOT_LOADED);

      jest
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockRejectedValue(new Error("test"));

      await loadUserCountry();

      expect(get(userCountryStore)).toEqual(
        new Error("Error loading user country")
      );
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

    it("should not call api if location store has an error", async () => {
      const countryCode = "CH";
      const apiFn = jest
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockResolvedValue(countryCode);
      userCountryStore.set(new Error("test"));

      await loadUserCountry();

      expect(apiFn).not.toHaveBeenCalled();
    });
  });
});
