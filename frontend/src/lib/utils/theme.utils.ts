import { Theme } from "../types/theme";
import { isNode } from "./dev.utils";
import { enumFromStringExists } from "./enum.utils";

export const THEME_ATTRIBUTE = "theme";

export const initTheme = (): Theme => {
  // Jest NodeJS environment has no document
  if (isNode()) {
    return Theme.DARK;
  }

  // Initial attribute value is set in the index.html
  const theme: string | null =
    document.documentElement.getAttribute(THEME_ATTRIBUTE);

  const initialTheme: Theme = enumFromStringExists({
    obj: Theme as unknown as Theme,
    value: theme,
  })
    ? (theme as Theme)
    : Theme.DARK;

  return initialTheme;
};

export const applyTheme = ({ theme }: { theme: Theme }) => {
  const { documentElement, head } = document;

  documentElement.setAttribute(THEME_ATTRIBUTE, theme);

  const color: string =
    getComputedStyle(documentElement).getPropertyValue("--card-background");

  // Update theme-color for mobile devices to customize the display of the page or of the surrounding user interface
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
  head?.children
    ?.namedItem("theme-color")
    ?.setAttribute("content", color.trim());
};
