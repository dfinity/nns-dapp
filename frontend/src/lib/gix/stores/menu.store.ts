import { Menu } from "$lib/gix/types/menu";
import { applyMenu, initMenu } from "$lib/gix/utils/menu.utils";
import { derived, writable, type Readable } from "svelte/store";

const initialMenu: Menu | undefined = initMenu();

export interface MenuStore extends Readable<Menu | undefined> {
  toggle: () => void;
  resetForTesting: () => void;
}

export const initMenuStore = (): MenuStore => {
  const { subscribe, set, update } = writable<Menu | undefined>(initialMenu);

  return {
    subscribe,

    toggle: () => {
      update((state) => {
        const menu = state === Menu.EXPANDED ? Menu.COLLAPSED : Menu.EXPANDED;

        applyMenu({ menu, preserve: true });
        return menu;
      });
    },

    resetForTesting: () => {
      set(Menu.EXPANDED);
    },
  };
};

export const menuStore = initMenuStore();

export const menuCollapsed = derived(
  menuStore,
  ($menuStore) => $menuStore === Menu.COLLAPSED
);
