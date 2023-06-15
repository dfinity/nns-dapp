import { isStoreData } from "$lib/utils/store.utils";

describe("store utils", () => {
  describe("isStoreData", () => {
    it("should return false if data is error or not loaded", () => {
      expect(isStoreData("not loaded")).toBe(false);
      expect(isStoreData(new Error())).toBe(false);
    });

    it("should return true if data is error nor 'not loaded'", () => {
      expect(isStoreData({ data: [] })).toBe(true);
      // It can also be a string
      expect(isStoreData("successful")).toBe(true);
    });
  });
});
