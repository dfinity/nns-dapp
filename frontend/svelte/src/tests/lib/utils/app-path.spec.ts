import { AppPath } from "../../../lib/constants/routes.constants";
import { isAppPath, isRoutePath } from "../../../lib/utils/app-path.utils";

describe("routes", () => {
  describe("isAppPath()", () => {
    it("should translate valid urls", () => {
      expect(isAppPath("/")).toBeTruthy();
      expect(isAppPath(AppPath.Accounts)).toBeTruthy();
      expect(isAppPath(`${AppPath.Wallet}/123`)).toBeTruthy();
    });

    it("should return null for invalid urls", () => {
      expect(isAppPath("/some-invalid-url")).toBeFalsy();
      expect(isAppPath("//")).toBeFalsy();
      expect(isAppPath(`${AppPath.Wallet}/`)).toBeFalsy();
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
