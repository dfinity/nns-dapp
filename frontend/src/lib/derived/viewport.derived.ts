import { browser } from "$app/environment";
import { derived, writable, type Readable } from "svelte/store";

// Value from gix
export const BREAKPOINT_SMALL = 576;

const viewportWidthWritable = writable<number>(
  browser ? window.innerWidth : BREAKPOINT_SMALL
);

if (browser) {
  const handleResize = () => viewportWidthWritable.set(window.innerWidth);
  window.addEventListener("resize", handleResize);
}

export const viewportWidthStore: Readable<number> = {
  subscribe: viewportWidthWritable.subscribe,
};

export const isMobileViewportStore: Readable<boolean> = derived(
  viewportWidthStore,
  ($viewportWidth) => $viewportWidth < BREAKPOINT_SMALL
);

export const setViewportWidthForTesting = (width: number) => {
  viewportWidthWritable.set(width);
};
