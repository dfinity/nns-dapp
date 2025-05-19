import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { get } from "svelte/store";

describe("balancesVisibility", () => {
  it("should be initialized with the default value", () => {
    expect(get(balancePrivacyOptionStore)).toBe("show");
  });

  it("should update value", () => {
    balancePrivacyOptionStore.set("hide");
    expect(get(balancePrivacyOptionStore)).toBe("hide");

    balancePrivacyOptionStore.set("show");
    expect(get(balancePrivacyOptionStore)).toBe("show");
  });

  it("should write to local storage", () => {
    balancePrivacyOptionStore.set("hide");

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.BalancePrivacyMode)
    ).toEqual('"hide"');
  });
});
