import { describe, expect, it } from "vitest";
import {
  assertValidCspSourceUrl,
  cspSourceFromUrl,
  escapeHtmlAttributeValue,
} from "../../../scripts/build.csp.utils.mjs";

describe("build.csp.utils", () => {
  // Values that config.sh really produces for VITE_AGGREGATOR_CANISTER_URL and
  // for the other addresses that reach the CSP meta tag.
  const realDeploymentUrls = [
    "https://3r4gx-wqaaa-aaaaq-aaaia-cai.icp0.io",
    "https://otgyv-wyaaa-aaaak-qcgba-cai.icp0.io",
    "http://sns_aggregator.localhost:8080",
    "http://localhost:8080",
    "https://icp-api.io",
    "https://icp0.io",
    "https://id.ai/",
    "https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/",
    "http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080",
    "https://dev-ingress.devenv.dfinity.network",
  ];

  const hostileUrls = [
    // Ends the attribute and the tag, then adds a script.
    'https://evil.com"><script src=https://evil.com/x.js></script>',
    // Ends the attribute only.
    'https://evil.com" data-x="',
    // Adds a source to the current directive.
    "https://icp-api.io https://evil.com",
    // Adds a directive to the policy.
    "https://icp-api.io; script-src *",
    // Adds a source with a comma.
    "https://icp-api.io,https://evil.com",
    // Adds a directive on a new line.
    "https://icp-api.io\nscript-src *",
    // Uses a scheme that runs code.
    "javascript:alert(1)",
    // Uses a scheme that carries a payload.
    "data:text/html,<script>alert(1)</script>",
    // Uses a wildcard instead of an address.
    "*",
    // Has no scheme.
    "//evil.com",
  ];

  describe("assertValidCspSourceUrl", () => {
    it("accepts every address that a real deployment uses", () => {
      for (const url of realDeploymentUrls) {
        expect(assertValidCspSourceUrl("TEST_URL", url)).toBe(url);
      }
    });

    it("rejects a hostile value", () => {
      for (const url of hostileUrls) {
        expect(() => assertValidCspSourceUrl("TEST_URL", url)).toThrow();
      }
    });

    it("names the value in the error", () => {
      expect(() =>
        assertValidCspSourceUrl("VITE_AGGREGATOR_CANISTER_URL", "*")
      ).toThrow(/VITE_AGGREGATOR_CANISTER_URL/);
    });

    it("rejects a missing or empty value", () => {
      expect(() => assertValidCspSourceUrl("TEST_URL", undefined)).toThrow();
      expect(() => assertValidCspSourceUrl("TEST_URL", "")).toThrow();
    });
  });

  describe("escapeHtmlAttributeValue", () => {
    it("escapes the characters that end an attribute or a tag", () => {
      expect(escapeHtmlAttributeValue('"><script>alert(1)</script>')).toBe(
        "&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"
      );
    });

    it("escapes an ampersand and a single quote", () => {
      expect(escapeHtmlAttributeValue("a&b'c")).toBe("a&amp;b&#x27;c");
    });

    it("leaves a real address unchanged", () => {
      for (const url of realDeploymentUrls) {
        expect(escapeHtmlAttributeValue(url)).toBe(url);
      }
    });
  });

  describe("cspSourceFromUrl", () => {
    it("returns a real address unchanged", () => {
      for (const url of realDeploymentUrls) {
        expect(cspSourceFromUrl("TEST_URL", url)).toBe(url);
      }
    });

    it("fails on a hostile value instead of dropping it", () => {
      for (const url of hostileUrls) {
        expect(() => cspSourceFromUrl("TEST_URL", url)).toThrow();
      }
    });
  });
});
