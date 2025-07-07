import {
  BREAKPOINT_SMALL,
  isMobileViewportStore,
  setViewportWidthForTesting,
  viewportWidthStore,
} from "$lib/derived/viewport.derived";
import { get } from "svelte/store";

describe("viewport.derived", () => {
  describe("viewportWidthStore", () => {
    it("should update when viewport width changes", () => {
      setViewportWidthForTesting(800);
      expect(get(viewportWidthStore)).toBe(800);

      setViewportWidthForTesting(400);
      expect(get(viewportWidthStore)).toBe(400);
    });
  });

  describe("isMobileViewportStore", () => {
    it("should return true for mobile viewport", () => {
      setViewportWidthForTesting(BREAKPOINT_SMALL - 1);
      expect(get(isMobileViewportStore)).toBe(true);
    });

    it("should return false for non-mobile viewport", () => {
      setViewportWidthForTesting(BREAKPOINT_SMALL);
      expect(get(isMobileViewportStore)).toBe(false);

      setViewportWidthForTesting(BREAKPOINT_SMALL + 100);
      expect(get(isMobileViewportStore)).toBe(false);
    });
  });
});
