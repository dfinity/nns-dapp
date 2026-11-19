// A no-op IntersectionObserver implementation. It is a class (rather than a
// `vi.fn()` returning an object) because it is invoked with `new`.
export class IntersectionObserverPassive implements IntersectionObserver {
  public readonly root: Element | Document | null = null;
  public readonly rootMargin: string = "";
  public readonly scrollMargin: string = "";
  public readonly thresholds: ReadonlyArray<number> = [];
  public takeRecords: () => IntersectionObserverEntry[] = () => [];

  observe = () => undefined;
  unobserve = () => undefined;
  disconnect = () => undefined;
}

export class IntersectionObserverActive implements IntersectionObserver {
  public readonly root: Element | Document | null = null;
  public readonly rootMargin: string = "";
  public readonly scrollMargin: string = "";
  public readonly thresholds: ReadonlyArray<number> = [];
  public takeRecords: () => IntersectionObserverEntry[] = () => [];

  constructor(
    private callback: (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => void,
    private options?: IntersectionObserverInit
  ) {}

  observe(element: HTMLElement) {
    this.callback(
      [
        {
          isIntersecting: true,
          target: element,
        } as unknown as IntersectionObserverEntry,
      ],
      this
    );
  }
  disconnect = () => null;
  unobserve = () => null;
}
