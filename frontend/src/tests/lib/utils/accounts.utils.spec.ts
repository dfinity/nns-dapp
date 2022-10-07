import {
  assertEnoughAccountFunds,
  emptyAddress,
  getAccountByPrincipal,
  getAccountFromStore,
  getPrincipalFromString,
  invalidAddress,
  isAccountHardwareWallet,
  mainAccount,
  routePathAccountIdentifier,
} from "$lib/utils/accounts.utils";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  mockAddressInputInvalid,
  mockAddressInputValid,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "../../mocks/sns-accounts.mock";

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

  describe("assertEnoughAccountFunds", () => {
    it("should throw if not enough balance", () => {
      const amountE8s = BigInt(1_000_000_000);
      expect(() => {
        assertEnoughAccountFunds({
          account: {
            ...mockMainAccount,
            balance: TokenAmount.fromE8s({
              amount: amountE8s,
              token: ICPToken,
            }),
          },
          amountE8s: amountE8s + BigInt(10_000),
        });
      }).toThrow();
    });

    it("should not throw if not enough balance", () => {
      const amountE8s = BigInt(1_000_000_000);
      expect(() => {
        assertEnoughAccountFunds({
          account: {
            ...mockMainAccount,
            balance: TokenAmount.fromE8s({
              amount: amountE8s,
              token: ICPToken,
            }),
          },
          amountE8s: amountE8s - BigInt(10_000),
        });
      }).not.toThrow();
    });
  });

  describe("mainAccount", () => {
    it("should return `main` nns account", () => {
      const accounts = [mockSubAccount, mockMainAccount, mockSubAccount];
      expect(mainAccount(accounts)).toEqual(mockMainAccount);
    });

    it("should return `main` sns account", () => {
      const accounts = [
        mockSnsSubAccount,
        mockSnsMainAccount,
        mockSnsSubAccount,
      ];
      expect(mainAccount(accounts)).toEqual(mockSnsMainAccount);
    });
  });

  describe("routePathAccountIdentifier", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());

    it("should get account identifier from valid path", () => {
      expect(
        routePathAccountIdentifier(`/#/wallet/${mockMainAccount.identifier}`)
      ).toEqual({
        accountIdentifier: mockMainAccount.identifier,
      });
    });

    it("should not get account identifier from invalid path", () => {
      expect(routePathAccountIdentifier("/#/wallet/")).toEqual(undefined);
      expect(routePathAccountIdentifier(undefined)).toBeUndefined();
    });
  });
});
