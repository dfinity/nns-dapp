import { INTERSECTION_THRESHOLD } from "$lib/constants/layout.constants";
import { dispatchIntersecting } from "$lib/utils/events.utils";

export const onIntersection = (element: HTMLElement) => {
  // IntersectionObserverInit is not recognized by the linter
   
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
