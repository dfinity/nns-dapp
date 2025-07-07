import { get } from "svelte/store";
import { describe, expect, it, vi } from "vitest";

const createMatchMediaMock = (matches: boolean) => {
  return vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe("viewport.derived", () => {
  it("should initialize as mobile when matchMedia matches", async () => {
    window.matchMedia = createMatchMediaMock(false);

    const { isMobileViewportStore } = await import(
      "$lib/derived/viewport.derived"
    );

    expect(get(isMobileViewportStore)).toBe(true);
  });

  it("should initialize as non-mobile when matchMedia does not match", async () => {
    window.matchMedia = createMatchMediaMock(true);

    const { isMobileViewportStore } = await import(
      "$lib/derived/viewport.derived"
    );

    expect(get(isMobileViewportStore)).toBe(false);
  });
});
