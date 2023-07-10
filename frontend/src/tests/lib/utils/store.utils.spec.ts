import { NOT_LOADED } from "$lib/constants/stores.constants";
import { isStoreData } from "$lib/utils/store.utils";

describe("store utils", () => {
  describe("isStoreData", () => {
    it("should return false if data is error or not loaded", () => {
      expect(isStoreData(NOT_LOADED)).toBe(false);
      expect(isStoreData(new Error())).toBe(false);
    });

    it("should return true if data is error nor 'not loaded'", () => {
      expect(isStoreData({ data: [] })).toBe(true);
      expect(isStoreData("successful")).toBe(true);
      expect(isStoreData(Symbol("test"))).toBe(true);
    });
  });
});
