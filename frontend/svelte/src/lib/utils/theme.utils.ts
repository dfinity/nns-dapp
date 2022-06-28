import { browser } from "../constants/environment.constants";
import { Theme } from "../types/theme";
import { enumFromStringExists } from "./enum.utils";

export const initTheme = (): Theme => {
  // Jest NodeJS environment has no document
  if (!browser) {
    return Theme.DARK;
  }

  const theme: string | null = document.documentElement.getAttribute("theme");

  const initialTheme: Theme = enumFromStringExists({
    obj: Theme as unknown as Theme,
    value: theme,
  })
    ? (theme as Theme)
    : Theme.DARK;

  applyTheme({ theme: initialTheme, preserve: false });

  return initialTheme;
};

export const applyTheme = ({
  theme,
  preserve = true,
}: {
  theme: Theme;
  preserve?: boolean;
}) => {
  const { documentElement, head } = document;

  documentElement.setAttribute("theme", theme);

  const color: string =
    getComputedStyle(documentElement).getPropertyValue("--card-background");

  // Update theme-color for mobile devices to customize the display of the page or of the surrounding user interface
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
  head?.children
    ?.namedItem("theme-color")
    ?.setAttribute("content", color.trim());

  if (preserve) {
    localStorage.setItem("theme", theme);
  }
};
