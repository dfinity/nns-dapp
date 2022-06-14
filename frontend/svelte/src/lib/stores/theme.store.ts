import { writable } from "svelte/store";
import { Theme } from "../types/theme";
import { applyTheme } from "../utils/theme.utils";

const { theme: storageTheme }: Storage = localStorage;

const initialTheme: Theme = storageTheme ?? Theme.DARK;
applyTheme(initialTheme);

export const initTheme = () => {
  const { subscribe, set } = writable<Theme>(initialTheme);

  return {
    subscribe,

    select: (theme: Theme) => {
      applyTheme(theme);
      set(theme);
    },
  };
};

export const themeStore = initTheme();
