import { AppPath, isRoutePath } from "../../routes/routes";

describe("routes", () => {
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
