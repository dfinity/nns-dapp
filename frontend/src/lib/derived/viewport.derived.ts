import { browser } from "$app/environment";
import { writable, type Readable } from "svelte/store";

export const BREAKPOINT_SMALL = 576;
export const BREAKPOINT_LARGE = 1024;

const createMediaQueryStore = (query: string): Readable<boolean> => {
  const store = writable<boolean>(false);

  if (browser) {
    const mediaQuery = window.matchMedia(query);
    store.set(mediaQuery.matches);

    mediaQuery.addEventListener("change", (event: MediaQueryListEvent) => {
      store.set(event.matches);
    });
  }

  return { subscribe: store.subscribe };
};

export const isMobileViewportStore = createMediaQueryStore(
  `(max-width: ${BREAKPOINT_SMALL - 1}px)`
);
export const isDesktopViewportStore = createMediaQueryStore(
  `(min-width: ${BREAKPOINT_LARGE}px)`
);
