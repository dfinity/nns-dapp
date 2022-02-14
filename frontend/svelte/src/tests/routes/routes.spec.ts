import { AppPath, isRoutePath, urlToAppPath } from "../../routes/routes";

describe("routes", () => {
  describe("urlToAppPath()", () => {
    it("should translate valid urls", () => {
      expect(urlToAppPath("/")).toBe(AppPath.Authentication);
      expect(urlToAppPath(AppPath.Accounts)).toBe(AppPath.Accounts);
      expect(urlToAppPath(`${AppPath.Wallet}/123`)).toBe(AppPath.Wallet);
    });

    it("should return null for invalid urls", () => {
      expect(urlToAppPath("/some-invalid-url")).toBeNull();
      expect(urlToAppPath("//")).toBeNull();
      expect(urlToAppPath(`${AppPath.Wallet}/`)).toBeNull();
    });
  });

  describe("isRoutePath()", () => {
    it("should compare static paths", () => {
      expect(
        isRoutePath({
          path: AppPath.Authentication,
          routePath: "/",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Accounts,
          routePath: "/#/accounts",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Authentication,
          routePath: "",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          path: AppPath.Accounts,
          routePath: "/#/neurons",
        })
      ).toBeFalsy();
    });

    it("should compare dynamic paths", () => {
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/0",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/a0",
        })
      ).toBeTruthy();
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/",
        })
      ).toBeFalsy();
      expect(
        isRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet",
        })
      ).toBeFalsy();
    });
  });
});
