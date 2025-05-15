import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { balancesVisibility } from "$lib/stores/balance-privacy-option.store";
import { get } from "svelte/store";

describe("balancesVisibility", () => {
  it("should be initialized with the default value", () => {
    expect(get(balancesVisibility)).toBe("show");
  });

  it("should update value", () => {
    balancesVisibility.set("hide");
    expect(get(balancesVisibility)).toBe("hide");

    balancesVisibility.set("show");
    expect(get(balancesVisibility)).toBe("show");
  });

  it("should write to local storage", () => {
    balancesVisibility.set("hide");

    expect(
      window.localStorage.getItem(StoreLocalStorageKey.BalancePrivacyOption)
    ).toEqual('"hide"');
  });
});
