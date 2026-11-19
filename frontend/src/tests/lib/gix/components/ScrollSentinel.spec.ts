import ScrollSentinel from "$lib/gix/components/ScrollSentinel.svelte";
import { layoutContentTopHidden } from "$lib/gix/stores/layout.store";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("ScrollSentinel", () => {
  let mockObserverInstance: MockIntersectionObserver;

  class MockIntersectionObserver implements IntersectionObserver {
    observe: (target: Element) => void = vi.fn();
    unobserve: (target: Element) => void = vi.fn();
    disconnect: () => void = vi.fn();
    takeRecords: () => IntersectionObserverEntry[] = () => [];
    root: Element | Document | null = null;
    rootMargin = "";
    scrollMargin = "";
    thresholds: ReadonlyArray<number> = [];

    constructor(private callback: IntersectionObserverCallback) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      mockObserverInstance = this;
    }

    // Simulates IntersectionObserver changes
    trigger(entries: Partial<IntersectionObserverEntry>[]) {
      this.callback(entries as IntersectionObserverEntry[], this);
    }
  }

  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should render a sentinel element", () => {
    const { container } = render(ScrollSentinel);

    expect(container.querySelector("[data-tid='sentinel']")).not.toBeNull();
  });

  it("should update the store on intersection", () => {
    expect(get(layoutContentTopHidden)).toBeFalsy();

    mockObserverInstance.trigger([{ isIntersecting: false }]);

    expect(get(layoutContentTopHidden)).toBeTruthy();

    mockObserverInstance.trigger([{ isIntersecting: true }]);

    expect(get(layoutContentTopHidden)).toBeFalsy();
  });
});
