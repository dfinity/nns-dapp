import "@testing-library/jest-dom";
// jsdom does not implement TextEncoder
// Polyfill the encoders with node
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// @ts-ignore
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    private callback: (entries: IntersectionObserverEntry[]) => void,
    private options?: IntersectionObserverInit
  ) {}

  observe(element: HTMLElement) {
    this.callback([
      {
        isIntersecting: true,
        target: element,
      } as unknown as IntersectionObserverEntry,
    ]);
  }

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
};
