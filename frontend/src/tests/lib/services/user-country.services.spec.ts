import * as locationApi from "$lib/api/location.api";
import { loadUserCountry } from "$lib/services/user-country.services";
import { userCountryStore } from "$lib/stores/user-country.store";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { get } from "svelte/store";
import { vi } from "vitest";

vi.mock("$lib/api/location.api");

describe("location services", () => {
  blockAllCallsTo(["$lib/api/location.api"]);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadUserLocation", () => {
    it("should set the location store to api response", async () => {
      expect(get(userCountryStore)).toBeUndefined();

      const countryCode = "CH";
      vi.spyOn(locationApi, "queryUserCountryLocation").mockResolvedValue(
        countryCode
      );

      await loadUserCountry();

      expect(get(userCountryStore)).toBe(countryCode);
    });

    it("should not call api if location store is already set", async () => {
      const countryCode = "CH";
      const apiFn = vi
        .spyOn(locationApi, "queryUserCountryLocation")
        .mockResolvedValue(countryCode);
      userCountryStore.set("CH");

      await loadUserCountry();

      expect(apiFn).not.toHaveBeenCalled();
    });
  });
});
