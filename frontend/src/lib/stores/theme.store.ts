import { storeLocalStorageKey } from "$lib/constants/stores.constants";
import type { Theme } from "$lib/types/theme";
import { applyTheme, initTheme } from "$lib/utils/theme.utils";
import { writableStored } from "./writable-stored";

const initialTheme: Theme = initTheme();

export const initThemeStore = () => {
  const { subscribe, set } = writableStored<Theme>({
    key: storeLocalStorageKey.Theme,
    defaultValue: initialTheme,
  });

  subscribe((theme: Theme) => {
    applyTheme({ theme });
  });

  return {
    subscribe,

    select: (theme: Theme) => {
      set(theme);
    },
  };
};

export const themeStore = initThemeStore();
