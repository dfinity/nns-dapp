import { writable } from "svelte/store";
import type { Theme } from "../types/theme";
import { applyTheme, initTheme } from "../utils/theme.utils";

const initialTheme: Theme = initTheme();

export const initThemeStore = () => {
  const { subscribe, set } = writable<Theme>(initialTheme);

  return {
    subscribe,

    select: (theme: Theme) => {
      applyTheme({ theme, preserve: true });
      set(theme);
    },
  };
};

export const themeStore = initThemeStore();
