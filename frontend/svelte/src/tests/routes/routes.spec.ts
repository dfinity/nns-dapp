import { AppPath, comparePathWithRoutePath } from "../../routes/routes";

describe("routes", () => {
  describe("comparePathWithRoutePath()", () => {
    it("should compare static paths", () => {
      expect(
        comparePathWithRoutePath({
          path: AppPath.Authentication,
          routePath: "/",
        })
      ).toBeTruthy();
      expect(
        comparePathWithRoutePath({
          path: AppPath.Accounts,
          routePath: "/#/accounts",
        })
      ).toBeTruthy();
      expect(
        comparePathWithRoutePath({
          path: AppPath.Authentication,
          routePath: "",
        })
      ).toBeFalsy();
      expect(
        comparePathWithRoutePath({
          path: AppPath.Accounts,
          routePath: "/#/neurons",
        })
      ).toBeFalsy();
    });

    it("should compare dynamic paths", () => {
      expect(
        comparePathWithRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/0",
        })
      ).toBeTruthy();
      expect(
        comparePathWithRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/a0",
        })
      ).toBeTruthy();
      expect(
        comparePathWithRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet/",
        })
      ).toBeFalsy();
      expect(
        comparePathWithRoutePath({
          path: AppPath.Wallet,
          routePath: "/#/wallet",
        })
      ).toBeFalsy();
    });
  });
});
