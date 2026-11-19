import { Theme, themeStore } from "$lib/gix";
import SystemThemeListener from "$lib/gix/components/SystemThemeListener.svelte";
import { render } from "$tests/lib/gix/test-utils/render.test-utils";
import { get } from "svelte/store";

describe("SystemThemeListener", () => {
  // Mock match media window events
  const listeners: {
    [key: string]: ((e: Partial<MediaQueryListEvent>) => void) | undefined;
  } = {};

  const mockMatchMedia = vi.fn((query) => ({
    matches: query === "(prefers-color-scheme: dark)",
    media: query,
    addEventListener: (
      name: string,
      handler: (e: Partial<MediaQueryListEvent>) => void
    ) => {
      listeners[name] = handler;
    },
    removeEventListener: (
      name: string,
      handler: (e: Partial<MediaQueryListEvent>) => void
    ) => {
      if (listeners[name] === handler) {
        listeners[name] = undefined;
      }
    },
    dispatchEvent: (event: Partial<MediaQueryListEvent>) =>
      listeners[event.type ?? ""]?.({ matches: true }),
  }));

  beforeEach(() => {
    vi.stubGlobal("matchMedia", mockMatchMedia);
  });

  it("should set theme to dark if no theme selected", () => {
    render(SystemThemeListener);

    // Init change event
    const changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true,
    });

    // Modify the event object to simulate the new theme state (e.g., matches = true for dark mode)
    Object.defineProperty(changeEvent, "matches", {
      value: true, // Simulate dark mode
    });

    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryList.dispatchEvent(changeEvent);

    expect(get(themeStore)).toEqual(Theme.DARK);
  });

  it("should leave theme on light if light theme explicitly selected", () => {
    render(SystemThemeListener);

    // Set theme to light initially
    themeStore.select(Theme.LIGHT);

    // Init change event
    const changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true,
    });

    // Modify the event object to simulate the new theme state (e.g., matches = true for dark mode)
    Object.defineProperty(changeEvent, "matches", {
      value: true, // Simulate dark mode
    });

    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryList.dispatchEvent(changeEvent);

    expect(get(themeStore)).toEqual(Theme.LIGHT);
  });

  it("should not change theme and run custom event handler", () => {
    const initialTestValue = "unchanged";
    const expectedTestValue = "changed";
    let testValue = initialTestValue;

    render(SystemThemeListener, {
      events: {
        nnsSystemThemeChange: () => {
          testValue = expectedTestValue;
        },
      },
    });

    // Set theme to light initially
    themeStore.select(Theme.LIGHT);

    // Init change event
    const changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true,
    });

    // Modify the event object to simulate the new theme state (e.g., matches = true for dark mode)
    Object.defineProperty(changeEvent, "matches", {
      value: true, // Simulate dark mode
    });

    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryList.dispatchEvent(changeEvent);

    expect(get(themeStore)).toEqual(Theme.LIGHT);
    expect(testValue).toEqual(expectedTestValue);
  });

  it("should run custom event handler and receive media query event data", () => {
    const initialTestValue = "";
    const expectedTestValue = "dark mode";
    let testValue = initialTestValue;

    render(SystemThemeListener, {
      events: {
        nnsSystemThemeChange: ($event: CustomEvent<MediaQueryListEvent>) => {
          testValue = $event.detail.matches ? "dark mode" : "light mode";
        },
      },
    });

    // Set theme to light initially
    themeStore.select(Theme.LIGHT);

    // Init change event
    const changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true,
    });

    // Modify the event object to simulate the new theme state (e.g., matches = true for dark mode)
    Object.defineProperty(changeEvent, "matches", {
      value: true, // Simulate dark mode
    });

    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryList.dispatchEvent(changeEvent);

    expect(testValue).toEqual(expectedTestValue);
  });
});
