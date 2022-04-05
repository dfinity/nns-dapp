import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../../lib/constants/accounts.constants";
import {
  emptyAddress,
  getAccountByPrincipal,
  invalidAddress,
} from "../../../lib/utils/accounts.utils";
import {
  mockAddressInput,
  mockMainAccount,
} from "../../mocks/accounts.store.mock";

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

  it("should be a invalid address", () => {
    expect(invalidAddress(undefined)).toBeTruthy();
    expect(invalidAddress("test")).toBeTruthy();

    expect(
      invalidAddress(mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH - 1))
    ).toBeTruthy();
  });

  it("should be a valid address", () => {
    expect(
      invalidAddress(mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH))
    ).toBeFalsy();
    expect(
      invalidAddress(mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH + 1))
    ).toBeFalsy();
  });

  it("should be an empty address", () => {
    expect(emptyAddress(undefined)).toBeTruthy();
    expect(emptyAddress("")).toBeTruthy();
  });

  it("should not be an empty address", () => {
    expect(emptyAddress("test")).toBeFalsy();
  });
});
