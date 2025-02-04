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
  // Prevent "TypeError: Cannot set properties of undefined (setting 'onfinish')" in vitest mode
  if (process.env.NODE_ENV === "test") {
    return {};
  }

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
