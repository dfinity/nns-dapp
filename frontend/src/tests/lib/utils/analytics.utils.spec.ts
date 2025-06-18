import {
  slugifyTitle,
} from "$lib/utils/analytics.utils";
describe("analytics.utils", () => {
  describe("slugifyTitle", () => {
    it("should convert camelCase to kebab-case", () => {
      expect(slugifyTitle("ckBTC")).toBe("ck-btc");
    });

    it("should remove special characters", () => {
      expect(slugifyTitle("c@#kBTC")).toBe("ck-btc");
    });

    it("should replace spaces with hyphens", () => {
      expect(slugifyTitle("Internet Computer")).toBe("internet-computer");
    });

    it("should remove leading and trailing hyphens", () => {
      expect(slugifyTitle("-Internet Computer ")).toBe("internet-computer");
    });
  });
});
