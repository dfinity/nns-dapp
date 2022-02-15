export class IntersectionObserverPassive {
  constructor(
    private callback: (entries: IntersectionObserverEntry[], observer) => void,
    private options?: IntersectionObserverInit
  ) {}

  observe(element: HTMLElement) {}

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
}

export class IntersectionObserverActive {
  constructor(
    private callback: (entries: IntersectionObserverEntry[], observer) => void,
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

  disconnect() {
    return null;
  }

  unobserve() {
    return null;
  }
}
