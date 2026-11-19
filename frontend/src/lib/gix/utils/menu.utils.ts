import { Menu } from "$lib/gix/types/menu";
import { enumFromStringExists } from "$lib/gix/utils/enum.utils";
import { isNode } from "$lib/gix/utils/env.utils";

export const MENU_ATTRIBUTE = "menu";
export const LOCALSTORAGE_MENU_KEY = "nnsMenu";

export const initMenu = (): Menu | undefined => {
  // No DOM therefore cannot guess the menu
  if (isNode()) {
    return undefined;
  }

  const menu: string | null =
    document.documentElement.getAttribute(MENU_ATTRIBUTE);

  const initialMenu: Menu = enumFromStringExists({
    obj: Menu,
    value: menu,
  })
    ? (menu as Menu)
    : Menu.EXPANDED;

  applyMenu({ menu: initialMenu, preserve: false });

  return initialMenu;
};

export const applyMenu = ({
  menu,
  preserve = true,
}: {
  menu: Menu;
  preserve?: boolean;
}) => {
  const { documentElement } = document;

  documentElement.setAttribute(MENU_ATTRIBUTE, menu);

  if (preserve) {
    localStorage.setItem(LOCALSTORAGE_MENU_KEY, JSON.stringify(menu));
  }
};
