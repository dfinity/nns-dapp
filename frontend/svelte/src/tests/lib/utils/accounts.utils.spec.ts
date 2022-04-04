import { getAccountByPrincipal } from "../../../lib/utils/accounts.utils";
import { mockMainAccount } from "../../mocks/accounts.store.mock";

describe("accounts-utils", () => {
  describe("getAccountByPrincipal", () => {
    it("returns main account when principal matches", () => {
      const accounts = {
        main: mockMainAccount,
        subAccounts: undefined,
      };

      console.log(mockMainAccount.principal?.toText());
      const found = getAccountByPrincipal({
        accounts,
        principal: mockMainAccount.principal?.toText() as string,
      });
      expect(found).toBe(mockMainAccount);
    });

    it("returns undefined if it doesn't match", () => {
      const accounts = {
        main: mockMainAccount,
        subAccounts: undefined,
      };

      const found = getAccountByPrincipal({
        accounts,
        principal: "bbbbb-aa",
      });
      expect(found).toBeUndefined();
    });
  });
});
