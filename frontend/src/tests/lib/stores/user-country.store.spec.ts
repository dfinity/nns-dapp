import {
  isUserCountryErrorStore,
  isUserCountryLoadingStore,
  userCountryStore,
} from "$lib/stores/user-country.store";
import { get } from "svelte/store";

describe("userCountryStore", () => {
  beforeEach(() => {
    userCountryStore.set(undefined);
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

  describe("isUserCountryLoadingStore", () => {
    beforeEach(() => {
      userCountryStore.set(undefined);
    });

    it("should return true when the location is undefined", () => {
      userCountryStore.set(undefined);
      expect(get(isUserCountryLoadingStore)).toBe(true);
    });

    it("should return false when the location is not undefined", () => {
      userCountryStore.set({ isoCode: "CH" });
      expect(get(isUserCountryLoadingStore)).toEqual(false);

      userCountryStore.set(new Error("Error"));
      expect(get(isUserCountryLoadingStore)).toEqual(false);
    });
  });

  describe("isUserCountryErrorStore", () => {
    beforeEach(() => {
      userCountryStore.set(undefined);
    });

    it("should return true when the location is an error", () => {
      userCountryStore.set(new Error("Error"));
      expect(get(isUserCountryErrorStore)).toBe(true);
    });

    it("should return false when the location is not an error", () => {
      userCountryStore.set({ isoCode: "CH" });
      expect(get(isUserCountryErrorStore)).toEqual(false);

      userCountryStore.set(undefined);
      expect(get(isUserCountryErrorStore)).toEqual(false);
    });
  });
});
