import type { Writable } from "svelte/store";

export interface SelectedSegment {
  id: symbol | undefined;
  element: HTMLElement | undefined | null;
}

export interface SegmentContext {
  store: Writable<SelectedSegment>;
}

export const SEGMENT_CONTEXT_KEY = Symbol("segment");
