import { AppPath } from "$lib/constants/routes.constants";
import { accountsNavigationEntryPointStore } from "$lib/stores/accounts-navigation-entry-point.store";
import { get } from "svelte/store";

describe("accounts-navigation-entry-point.store", () => {
  it("should have an initial value", () => {
    expect(get(accountsNavigationEntryPointStore)).toEqual(AppPath.Tokens);
  });

  it("should set", () => {
    accountsNavigationEntryPointStore.set(AppPath.Portfolio);

    expect(get(accountsNavigationEntryPointStore)).toEqual(AppPath.Portfolio);
  });
});
