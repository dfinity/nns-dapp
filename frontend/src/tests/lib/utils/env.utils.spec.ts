/**
 * @jest-environment jsdom
 */

import { addRawToUrl, isNnsAlternativeOrigin } from "$lib/utils/env.utils";

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

    it("should be an alternative origin", () => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          origin: `https://nns.internetcomputer.org`,
        },
      });

      expect(isNnsAlternativeOrigin()).toBeTruthy();
    });

    it("should not be an alternative origin", () => {
      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          origin: `https://nns.ic0.app`,
        },
      });

      expect(isNnsAlternativeOrigin()).toBeFalsy();

      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          origin: `https://ic0.app`,
        },
      });

      expect(isNnsAlternativeOrigin()).toBeFalsy();

      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          origin: `https://test.com`,
        },
      });

      expect(isNnsAlternativeOrigin()).toBeFalsy();

      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          origin: `https://internetcomputer.org`,
        },
      });

      expect(isNnsAlternativeOrigin()).toBeFalsy();

      Object.defineProperty(window, "location", {
        writable: true,
        value: {
          ...location,
          origin: `https://ii.internetcomputer.org`,
        },
      });

      expect(isNnsAlternativeOrigin()).toBeFalsy();
    });
  });

  describe("addRawToUrl", () => {
    it("adds raw to url", () => {
      expect(
        addRawToUrl(
          "https://53zcu-tiaaa-aaaaa-qaaba-cai.medium09.testnet.dfinity.network"
        )
      ).toBe(
        "https://53zcu-tiaaa-aaaaa-qaaba-cai.raw.medium09.testnet.dfinity.network"
      );

      expect(
        addRawToUrl(
          "https://53zcu-tiaaa-aaaaa-qaaba-cai.nnsdapp.testnet.dfinity.network"
        )
      ).toBe(
        "https://53zcu-tiaaa-aaaaa-qaaba-cai.raw.nnsdapp.testnet.dfinity.network"
      );

      expect(
        addRawToUrl(
          "https://53zcu-tiaaa-aaaaa-qaaba-cai.nnsdapp.testnet.dfinity.network/"
        )
      ).toBe(
        "https://53zcu-tiaaa-aaaaa-qaaba-cai.raw.nnsdapp.testnet.dfinity.network/"
      );
    });

    it("raises if url is not a valid url", () => {
      const invalid1 = "http**://example.com";
      expect(() => addRawToUrl(invalid1)).toThrow(
        new TypeError(`Invalid URL: ${invalid1}`)
      );

      const invalid2 = "";
      expect(() => addRawToUrl(invalid2)).toThrow(
        new TypeError(`Invalid URL: ${invalid2}`)
      );
    });
  });
});
