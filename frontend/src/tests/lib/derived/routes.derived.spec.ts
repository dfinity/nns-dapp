import { AppPath } from "$lib/constants/routes.constants";
import { accountsPageOrigin } from "$lib/derived/routes.derived";
import { referrerPathStore } from "$lib/stores/routes.store";
import { get } from "svelte/store";

describe("accountsPageOrigin.derived", () => {
  it("should return Tokens page as default when history is empty", () => {
    expect(get(accountsPageOrigin)).toBe(AppPath.Tokens);
  });

  it("should return Portfolio when it was the last main page visited", () => {
    referrerPathStore.pushPath(AppPath.Tokens);
    referrerPathStore.pushPath(AppPath.Portfolio);

    expect(get(accountsPageOrigin)).toBe(AppPath.Portfolio);
  });

  it("should return Tokens when it was the last main page visited", () => {
    referrerPathStore.pushPath(AppPath.Tokens);
    referrerPathStore.pushPath(AppPath.Portfolio);
    referrerPathStore.pushPath(AppPath.Tokens);

    expect(get(accountsPageOrigin)).toBe(AppPath.Tokens);
  });

  it("should return Tokens as default when no main pages were visited", () => {
    referrerPathStore.pushPath(AppPath.Staking);
    referrerPathStore.pushPath(AppPath.Settings);

    expect(get(accountsPageOrigin)).toBe(AppPath.Tokens);
  });

  it("should return Portfolio when it was last main page among other pages", () => {
    referrerPathStore.pushPath(AppPath.Tokens);
    referrerPathStore.pushPath(AppPath.Portfolio);
    referrerPathStore.pushPath(AppPath.Settings);

    expect(get(accountsPageOrigin)).toBe(AppPath.Portfolio);
  });
});
