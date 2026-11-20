import { menuCollapsed, menuStore } from "$lib/gix";
import { Menu } from "$lib/gix/types/menu";
import { get } from "svelte/store";

describe("menu-store", () => {
  beforeEach(() => {
    menuStore.resetForTesting();
  });

  it("should derive collapsed", () => {
    const storeExpanded = get(menuStore);

    expect(storeExpanded).toBe(Menu.EXPANDED);

    const derivedCollapsed = get(menuCollapsed);

    expect(derivedCollapsed).toBeFalsy();

    menuStore.toggle();

    const storeCollapsed = get(menuStore);

    expect(storeCollapsed).toBe(Menu.COLLAPSED);

    const derivedCollapsed2 = get(menuCollapsed);

    expect(derivedCollapsed2).toBeTruthy();
  });

  it("should reset to EXPANDED for testing", () => {
    expect(get(menuStore)).toBe(Menu.EXPANDED);

    menuStore.toggle();

    const storeCollapsed = get(menuStore);

    expect(storeCollapsed).toBe(Menu.COLLAPSED);

    menuStore.resetForTesting();

    expect(get(menuStore)).toBe(Menu.EXPANDED);
  });
});
