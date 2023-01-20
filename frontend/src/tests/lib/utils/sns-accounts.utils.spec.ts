import { sumAccounts } from "$lib/utils/sns-accounts.utils";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";

describe("sns-accounts-utils", () => {
  describe("sumAccounts", () => {
    it("should sum accounts balance", () => {
      let totalBalance =
        mockSnsMainAccount.balance.toE8s() + mockSnsSubAccount.balance.toE8s();

      expect(
        sumAccounts([mockSnsMainAccount, mockSnsSubAccount]).toE8s()
      ).toEqual(totalBalance);

      totalBalance = mockSnsMainAccount.balance.toE8s();

      expect(sumAccounts([mockSnsMainAccount]).toE8s()).toEqual(totalBalance);
    });

    it("should sum ICP", () => {
      expect(
        sumAccounts([mockSnsMainAccount, mockSnsSubAccount]).token.name
      ).toEqual(mockSnsMainAccount.balance.token.name);
    });
  });
});
