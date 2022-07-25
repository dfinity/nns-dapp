import { Principal } from "@dfinity/principal";
import {
  emptyAddress,
  getAccountByPrincipal,
  getAccountFromStore,
  getPrincipalFromString,
  invalidAddress,
  isAccountHardwareWallet,
} from "../../../lib/utils/accounts.utils";
import {
  mockAddressInputInvalid,
  mockAddressInputValid,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";

describe("accounts-utils", () => {
  describe("getAccountByPrincipal", () => {
    it("returns main account when principal matches", () => {
      const accounts = {
        main: mockMainAccount,
        subAccounts: undefined,
      };

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

  describe("invalidAddress", () => {
    it("should be a invalid address", () => {
      expect(invalidAddress(undefined)).toBeTruthy();
      expect(invalidAddress("test")).toBeTruthy();
      expect(invalidAddress(mockAddressInputInvalid)).toBeTruthy();
    });

    it("should be a valid address", () => {
      expect(invalidAddress(mockAddressInputValid)).toBeFalsy();
    });
  });

  describe("emptyAddress", () => {
    it("should be an empty address", () => {
      expect(emptyAddress(undefined)).toBeTruthy();
      expect(emptyAddress("")).toBeTruthy();
    });

    it("should not be an empty address", () => {
      expect(emptyAddress("test")).toBeFalsy();
    });
  });

  describe("getPrincipalFromString", () => {
    it("returns undefined when invalid address", () => {
      expect(getPrincipalFromString("aa")).toBeUndefined();
      expect(getPrincipalFromString("aaasfdadaasdf")).toBeUndefined();
    });

    it("returns principal when valid address", () => {
      expect(getPrincipalFromString("aaaaa-aa")).toBeInstanceOf(Principal);
      expect(
        getPrincipalFromString(
          "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe"
        )
      ).toBeInstanceOf(Principal);
    });
  });

  describe("isHardwareWallet", () => {
    it("returns true if type hardware wallet", () => {
      expect(isAccountHardwareWallet(mockHardwareWalletAccount)).toBeTruthy();
    });

    it("returns false if type no hardware wallet", () => {
      expect(isAccountHardwareWallet(mockMainAccount)).toBeFalsy();
      expect(isAccountHardwareWallet(mockSubAccount)).toBeFalsy();
    });

    it("returns false if no account", () => {
      expect(isAccountHardwareWallet(undefined)).toBeFalsy();
    });
  });

  describe("getAccountFromStore", () => {
    const accountsStore = {
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
    };

    it("should not return an account if no identifier is provided", () => {
      expect(
        getAccountFromStore({ identifier: undefined, accountsStore })
      ).toBeUndefined();
    });

    it("should find no account if not matches", () => {
      expect(
        getAccountFromStore({ identifier: "aaa", accountsStore })
      ).toBeUndefined();
    });

    it("should return corresponding account", () => {
      expect(
        getAccountFromStore({
          identifier: mockMainAccount.identifier,
          accountsStore,
        })
      ).toEqual(mockMainAccount);
      expect(
        getAccountFromStore({
          identifier: mockSubAccount.identifier,
          accountsStore,
        })
      ).toEqual(mockSubAccount);
    });
  });
});
