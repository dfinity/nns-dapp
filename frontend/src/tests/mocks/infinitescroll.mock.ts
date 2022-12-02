// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

export const IntersectionObserverPassive = jest.fn();
IntersectionObserverPassive.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});

let isIntersecting = true;
export const mockIntersectionObserverIsIntersecting = (intersecting: boolean) =>
  (isIntersecting = intersecting);

export class IntersectionObserverActive implements IntersectionObserver {
  public readonly root: Element | Document | null;
  public readonly rootMargin: string;
  public readonly thresholds: ReadonlyArray<number>;
  public takeRecords: () => IntersectionObserverEntry[];

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
          isIntersecting,
          target: element,
        } as unknown as IntersectionObserverEntry,
      ],
      this
    );
  }
  disconnect = () => null;
  unobserve = () => null;
}
