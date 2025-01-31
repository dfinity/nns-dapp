import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";
import { get } from "svelte/store";

describe("hideZeroBalancesStore", () => {
  it("should be initialized with the default value", () => {
    expect(get(hideZeroBalancesStore)).toBe("show");
  });

  it("should update value", () => {
    hideZeroBalancesStore.set("hide");
    expect(get(hideZeroBalancesStore)).toBe("hide");

    hideZeroBalancesStore.set("show");
    expect(get(hideZeroBalancesStore)).toBe("show");
  });

  it("should write to local storage", () => {
    hideZeroBalancesStore.set("hide");

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.HideZeroBalances)
    ).toEqual('"hide"');
  });
});
