import { initThemeStore, themeStore } from "$lib/gix";
import { Theme } from "$lib/gix/types/theme";
import * as envUtils from "$lib/gix/utils/env.utils";
import * as themeUtils from "$lib/gix/utils/theme.utils";
import {
  LOCALSTORAGE_THEME_KEY,
  THEME_ATTRIBUTE,
} from "$lib/gix/utils/theme.utils";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";

describe("theme-store", () => {
  let initThemeSpy: MockInstance;
  let applyThemeSpy: MockInstance;
  let resetThemeSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.resetAllMocks();

    window.document.documentElement.removeAttribute(THEME_ATTRIBUTE);

    vi.spyOn(envUtils, "isNode").mockReturnValue(false);

    initThemeSpy = vi.spyOn(themeUtils, "initTheme");
    applyThemeSpy = vi.spyOn(themeUtils, "applyTheme");
    resetThemeSpy = vi.spyOn(themeUtils, "resetTheme");
  });

  afterAll(() => {
    window.document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it("should initialize with no theme if the theme is not set", () => {
    expect(get(themeStore)).toBeUndefined();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBeNull();
    expect(localStorage.getItem(LOCALSTORAGE_THEME_KEY)).toBeNull();
  });

  it.each(Object.values(Theme))(
    "should initialise with the current '%s' theme",
    (theme) => {
      window.document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);

      const themeStore = initThemeStore();

      expect(get(themeStore)).toBe(theme);
      expect(initThemeSpy).toHaveBeenCalledOnce();
    }
  );

  it("should apply and store the selected theme", () => {
    expect(get(themeStore)).toBeUndefined();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBeNull();
    expect(localStorage.getItem(LOCALSTORAGE_THEME_KEY)).toBeNull();

    themeStore.select(Theme.LIGHT);

    expect(get(themeStore)).toBe(Theme.LIGHT);
    expect(applyThemeSpy).toHaveBeenCalledOnce();
    expect(applyThemeSpy).toHaveBeenCalledWith({
      theme: Theme.LIGHT,
      preserve: true,
    });
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      Theme.LIGHT
    );
    expect(localStorage.getItem(LOCALSTORAGE_THEME_KEY)).toBe(
      JSON.stringify(Theme.LIGHT)
    );

    themeStore.select(Theme.DARK);

    expect(get(themeStore)).toBe(Theme.DARK);
    expect(applyThemeSpy).toHaveBeenCalledTimes(2);
    expect(applyThemeSpy).toHaveBeenCalledWith({
      theme: Theme.DARK,
      preserve: true,
    });
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      Theme.DARK
    );
    expect(localStorage.getItem(LOCALSTORAGE_THEME_KEY)).toBe(
      JSON.stringify(Theme.DARK)
    );

    // Just to double-check, we set it to light once more
    themeStore.select(Theme.LIGHT);

    expect(get(themeStore)).toBe(Theme.LIGHT);
    expect(applyThemeSpy).toHaveBeenCalledTimes(3);
    expect(applyThemeSpy).toHaveBeenCalledWith({
      theme: Theme.LIGHT,
      preserve: true,
    });
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      Theme.LIGHT
    );
    expect(localStorage.getItem(LOCALSTORAGE_THEME_KEY)).toBe(
      JSON.stringify(Theme.LIGHT)
    );
  });

  it("should reset to the current system theme", () => {
    const originalMatchMedia = window.matchMedia;

    // We mock window.matchMedia to match the DARK theme
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn().mockImplementation(() => ({
        matches: true,
      })),
    });

    // We first set the store, then we mock that the attribute may be changed in a different way
    themeStore.select(Theme.LIGHT);

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      Theme.LIGHT
    );

    window.document.documentElement.setAttribute(THEME_ATTRIBUTE, Theme.DARK);

    themeStore.resetToSystemSettings();

    expect(get(themeStore)).toBe(Theme.DARK);
    expect(resetThemeSpy).toHaveBeenCalledWith(Theme.DARK);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      Theme.DARK
    );
    expect(localStorage.getItem(LOCALSTORAGE_THEME_KEY)).toBeNull();

    // We mock window.matchMedia to match the LIGHT theme
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn().mockImplementation(() => ({
        matches: false,
      })),
    });

    // We first set the store, then we mock that the attribute may be changed in a different way
    themeStore.select(Theme.DARK);

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      Theme.DARK
    );

    window.document.documentElement.setAttribute(THEME_ATTRIBUTE, Theme.LIGHT);

    themeStore.resetToSystemSettings();

    expect(get(themeStore)).toBe(Theme.LIGHT);
    expect(resetThemeSpy).toHaveBeenCalledWith(Theme.LIGHT);
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      Theme.LIGHT
    );
    expect(localStorage.getItem(LOCALSTORAGE_THEME_KEY)).toBeNull();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("should handle gracefully when the theme is not set", () => {
    window.document.documentElement.removeAttribute(THEME_ATTRIBUTE);

    const themeStore = initThemeStore();

    expect(get(themeStore)).toBe(Theme.DARK);
  });

  it("should handle gracefully when the theme is not correctly set", () => {
    window.document.documentElement.setAttribute(
      THEME_ATTRIBUTE,
      "invalid-theme"
    );

    const themeStore = initThemeStore();

    expect(get(themeStore)).toBe(Theme.DARK);
  });
});
