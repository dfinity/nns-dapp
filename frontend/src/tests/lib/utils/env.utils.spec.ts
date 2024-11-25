import { isLastCall, isNnsAlternativeOrigin } from "$lib/utils/env.utils";

describe("env-utils", () => {
  describe("isNnsAlternativeOrigin", () => {
    let location;

    beforeEach(() => {
      location = window.location;
    });

    const setOrigin = (origin: string) => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          origin,
        },
      });
    };

    it("should be an alternative origin", () => {
      setOrigin("https://nns.internetcomputer.org");
      expect(isNnsAlternativeOrigin()).toBeTruthy();

      setOrigin("https://wallet.internetcomputer.org");
      expect(isNnsAlternativeOrigin()).toBeTruthy();

      setOrigin("https://wallet.ic0.app");
      expect(isNnsAlternativeOrigin()).toBeTruthy();

      setOrigin("https://beta.nns.internetcomputer.org");
      expect(isNnsAlternativeOrigin()).toBeTruthy();

      setOrigin("https://beta.nns.ic0.app");
      expect(isNnsAlternativeOrigin()).toBeTruthy();
    });

    it("should not be an alternative origin", () => {
      setOrigin("https://nns.ic0.app");
      expect(isNnsAlternativeOrigin()).toBe(false);

      setOrigin("https://ic0.app");
      expect(isNnsAlternativeOrigin()).toBe(false);

      setOrigin("https://test.com");
      expect(isNnsAlternativeOrigin()).toBe(false);

      setOrigin("https://internetcomputer.org");
      expect(isNnsAlternativeOrigin()).toBe(false);

      setOrigin("https://ii.internetcomputer.org");
      expect(isNnsAlternativeOrigin()).toBe(false);

      setOrigin("https://beta.internetcomputer.org");
      expect(isNnsAlternativeOrigin()).toBe(false);

      setOrigin("https://beta.ic0.app");
      expect(isNnsAlternativeOrigin()).toBe(false);
    });
  });

  describe("isLastCall", () => {
    it("should return true when certified", () => {
      expect(
        isLastCall({ strategy: "query_and_update", certified: true })
      ).toBe(true);
      expect(isLastCall({ strategy: "update", certified: true })).toBe(true);
    });

    it("should return true for single call", () => {
      expect(isLastCall({ strategy: "query", certified: false })).toBe(true);
      expect(isLastCall({ strategy: "update", certified: true })).toBe(true);
    });

    it("should return false for query of query_and_update ", () => {
      expect(
        isLastCall({ strategy: "query_and_update", certified: false })
      ).toBe(false);
    });
  });
});
