import type { Theme } from "../types/theme";

export const applyTheme = (theme: Theme) => {
  const { documentElement, head } = document;

  documentElement.setAttribute("theme", theme);

  const color: string = getComputedStyle(documentElement).getPropertyValue(
    "--gray-50-background"
  );

  // Update theme-color for mobile devices to customize the display of the page or of the surrounding user interface
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
  head?.children
    ?.namedItem("theme-color")
    ?.setAttribute("content", color.trim());

  localStorage.setItem("theme", theme);
};
