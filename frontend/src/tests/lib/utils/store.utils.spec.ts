import { isStoreData } from "$lib/utils/store.utils";

describe("isStoreData", () => {
  it("should return false if data is error or not loaded", () => {
    expect(isStoreData("not loaded")).toBe(false);
    expect(isStoreData(new Error())).toBe(false);
  });

  it("should return true if data is error or not loaded", () => {
    expect(isStoreData({ data: [] })).toBe(true);
  });
});
