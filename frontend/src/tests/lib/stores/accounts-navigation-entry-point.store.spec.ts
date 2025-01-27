import { AppPath } from "$lib/constants/routes.constants";
import { accountsNavigationEntryPoint } from "$lib/stores/accounts-navigation-entry-point.store";
import { get } from "svelte/store";

describe("accounts-navigation-entry-point.store", () => {
  it("should have an initial value", () => {
    expect(get(accountsNavigationEntryPoint)).toEqual(AppPath.Tokens);
  });

  it("should set", () => {
    accountsNavigationEntryPoint.set(AppPath.Portfolio);

    expect(get(accountsNavigationEntryPoint)).toEqual(AppPath.Portfolio);
  });
});
