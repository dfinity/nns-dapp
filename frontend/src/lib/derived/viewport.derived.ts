import { browser } from "$app/environment";
import { writable, type Readable } from "svelte/store";

export const BREAKPOINT_SMALL = 576;

const mobileMediaQueryWritable = writable<boolean>(false);

if (browser) {
  const mediaQuery = window.matchMedia(
    `(max-width: ${BREAKPOINT_SMALL - 1}px)`
  );

  mobileMediaQueryWritable.set(mediaQuery.matches);

  mediaQuery.addEventListener("change", (event: MediaQueryListEvent) => {
    mobileMediaQueryWritable.set(event.matches);
  });
}

export const isMobileViewportStore: Readable<boolean> = {
  subscribe: mobileMediaQueryWritable.subscribe,
};
