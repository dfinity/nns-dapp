export const heightTransition = (
  element: HTMLElement,
  {
    delay,
    duration,
  }: {
    delay?: number;
    duration?: number;
  }
) => {
  const height = element.offsetHeight;
  return {
    delay,
    duration,
    css: (t: number) =>
      `height: ${
        t * height
      }px; transform: scale(1, ${t}); transform-origin: top`,
  };
};
