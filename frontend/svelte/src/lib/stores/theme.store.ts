import { writable } from "svelte/store";
import { Theme } from "../types/theme";
import { applyTheme } from "../utils/theme.utils";

// TODO: enum validation
const initialTheme: Theme =
  (document.documentElement.getAttribute("theme") as Theme) ?? Theme.DARK;

applyTheme({ theme: initialTheme, preserve: false });

export const initTheme = () => {
  const { subscribe, set } = writable<Theme>(initialTheme);

  return {
    subscribe,

    select: (theme: Theme) => {
      applyTheme({ theme, preserve: true });
      set(theme);
    },
  };
};

export const themeStore = initTheme();
