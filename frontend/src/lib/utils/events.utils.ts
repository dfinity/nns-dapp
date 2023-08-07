import type { IntersectingDetail } from "$lib/types/intersection.types";

export const emit = <T>({
  message,
  detail,
}: {
  message: string;
  detail?: T | undefined;
}) => {
  const $event: CustomEvent<T> = new CustomEvent<T>(message, {
    detail,
    bubbles: true,
  });
  document.dispatchEvent($event);
};

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
