import {
  isLastCall,
  isLocalhost,
  isNnsAlternativeOrigin,
} from "$lib/utils/env.utils";

describe("env-utils", () => {
  describe("isNnsAlternativeOrigin", () => {
    let location;

    beforeAll(() => {
      location = window.location;
    });

    afterAll(() => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: { ...location },
      });
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

  describe("isLocalhost", () => {
    it("return false when hostname is not localhost", () => {
      expect(
        isLocalhost(
          "53zcu-tiaaa-aaaaa-qaaba-cai.medium09.testnet.dfinity.network"
        )
      ).toBe(false);
      expect(isLocalhost("internetcomputer.org")).toBe(false);
      expect(isLocalhost("nns.ic0.app")).toBe(false);
    });

    it("return true when hostname is localhost", () => {
      expect(isLocalhost("localhost:3000")).toBe(true);
      expect(isLocalhost("127.0.0.1:3000")).toBe(true);
      expect(isLocalhost("xxxx.localhost")).toBe(true);
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
