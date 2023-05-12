import {
  isUserCountryErrorStore,
  isUserCountryLoadedStore,
  userCountryStore,
} from "$lib/stores/user-country.store";
import { get } from "svelte/store";

describe("userCountryStore", () => {
  beforeEach(() => {
    userCountryStore.set("not loaded");
  });

  describe("userCountryStore", () => {
    it("should set the location store", () => {
      const ch = { isoCode: "CH" };
      userCountryStore.set(ch);
      expect(get(userCountryStore)).toEqual(ch);

      const us = { isoCode: "US" };
      userCountryStore.set(us);
      expect(get(userCountryStore)).toEqual(us);
    });
  });

  describe("isUserCountryLoadedStore", () => {
    beforeEach(() => {
      userCountryStore.set("not loaded");
    });

    it("should return false when the location is 'not loaded'", () => {
      userCountryStore.set("not loaded");
      expect(get(isUserCountryLoadedStore)).toBe(false);
    });

    it("should return true when the location is loaded", () => {
      userCountryStore.set({ isoCode: "CH" });
      expect(get(isUserCountryLoadedStore)).toEqual(true);

      userCountryStore.set(new Error("Error"));
      expect(get(isUserCountryLoadedStore)).toEqual(true);
    });
  });

  describe("isUserCountryErrorStore", () => {
    beforeEach(() => {
      userCountryStore.set("not loaded");
    });

    it("should return true when the location is an error", () => {
      userCountryStore.set(new Error("Error"));
      expect(get(isUserCountryErrorStore)).toBe(true);
    });

    it("should return false when the location is not an error", () => {
      userCountryStore.set({ isoCode: "CH" });
      expect(get(isUserCountryErrorStore)).toEqual(false);

      userCountryStore.set("not loaded");
      expect(get(isUserCountryErrorStore)).toEqual(false);
    });
  });
});
