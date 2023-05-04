import * as locationApi from "$lib/api/location.api";
import { loadUserLocation } from "$lib/services/location.services";
import { locationStore } from "$lib/stores/location.store";
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
      const countryCode = "CH";
      jest
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockResolvedValue(countryCode);

      await loadUserLocation();

      expect(get(locationStore)).toBe(countryCode);
    });

    it("should not call api if location store is already set", async () => {
      const countryCode = "CH";
      const apiFn = jest
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockResolvedValue(countryCode);
      locationStore.set("CH");

      await loadUserLocation();

      expect(apiFn).not.toHaveBeenCalled();
    });
  });
});
