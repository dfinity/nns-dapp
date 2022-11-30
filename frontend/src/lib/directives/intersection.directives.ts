import { INTERSECTION_THRESHOLD } from "$lib/constants/layout.constants";
import type { IntersectingDetail } from "$lib/types/intersection.types";

// Exposed for test purpose only
export const dispatchIntersecting = ({
  element,
  intersecting,
}: {
  element: HTMLElement;
  intersecting: boolean;
}) => {
  const $event = new CustomEvent<IntersectingDetail>("nnsIntersecting", {
    detail: { intersecting },
    bubbles: false,
  });
  element.dispatchEvent($event);
};

export const onIntersection = (element: HTMLElement) => {
  // IntersectionObserverInit is not recognized by the linter
  // eslint-disable-next-line no-undef
  const options: IntersectionObserverInit = {
    threshold: INTERSECTION_THRESHOLD,
  };

  const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
    const intersecting: boolean =
      entries.find(
        ({ isIntersecting }: IntersectionObserverEntry) => isIntersecting
      ) !== undefined;

    dispatchIntersecting({ element, intersecting });
  };

  const observer: IntersectionObserver = new IntersectionObserver(
    intersectionCallback,
    options
  );

  observer.observe(element);

  return {
    destroy() {
      observer.disconnect();
    },
  };
};
