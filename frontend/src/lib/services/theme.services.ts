import { nonNullish } from "@dfinity/utils";

type Theme = "light" | "dark";

export const getCurrentTheme = (): Theme | undefined => {
  const htmlTheme = document.querySelector("html")?.getAttribute("theme");
  if (nonNullish(htmlTheme) && ["light", "dark"].includes(htmlTheme)) {
    return htmlTheme as Theme;
  }
  return undefined;
};
