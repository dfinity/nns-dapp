import { AppPath, comparePathWithRoutePath } from "../../routes/routes";

describe("routes", () => {
  describe("comparePathWithRoutePath()", () => {
    it("should compare static paths", () => {
      expect(
        comparePathWithRoutePath(AppPath.Authentication, "/")
      ).toBeTruthy();
      expect(
        comparePathWithRoutePath(AppPath.Accounts, "/#/accounts")
      ).toBeTruthy();
      expect(comparePathWithRoutePath(AppPath.Authentication, "")).toBeFalsy();
      expect(
        comparePathWithRoutePath(AppPath.Accounts, "/#/neurons")
      ).toBeFalsy();
    });

    it("should compare dynamic paths", () => {
      expect(
        comparePathWithRoutePath(AppPath.Wallet, "/#/wallet/0")
      ).toBeTruthy();
      expect(
        comparePathWithRoutePath(AppPath.Wallet, "/#/wallet/a0")
      ).toBeTruthy();
      expect(
        comparePathWithRoutePath(AppPath.Wallet, "/#/wallet/")
      ).toBeFalsy();
      expect(comparePathWithRoutePath(AppPath.Wallet, "/#/wallet")).toBeFalsy();
    });
  });
});
