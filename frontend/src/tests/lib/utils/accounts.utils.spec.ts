import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  accountName,
  assertEnoughAccountFunds,
  emptyAddress,
  getAccountByPrincipal,
  getAccountByRootCanister,
  getAccountFromStore,
  getAccountsByRootCanister,
  getPrincipalFromString,
  invalidAddress,
  isAccountHardwareWallet,
  mainAccount,
} from "$lib/utils/accounts.utils";
import { AnonymousIdentity } from "@dfinity/agent";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { encodeSnsAccount } from "@dfinity/sns";
import {
  mockAddressInputInvalid,
  mockAddressInputValid,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import { mockPrincipal } from "../../mocks/auth.store.mock";
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

    it("should return false for sns accounts", () => {
      const subaccount = new Uint8Array(32).fill(0);
      subaccount[31] = 1;
      const account = {
        owner: new AnonymousIdentity().getPrincipal(),
        subaccount: subaccount,
      };
      const subaccountString = encodeSnsAccount(account);
      expect(invalidAddress(subaccountString)).toBeFalsy();
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
    const accounts = [mockMainAccount, mockSubAccount];

    it("should not return an account if no identifier is provided", () => {
      expect(
        getAccountFromStore({ identifier: undefined, accounts })
      ).toBeUndefined();
    });

    it("should find no account if not matches", () => {
      expect(
        getAccountFromStore({ identifier: "aaa", accounts })
      ).toBeUndefined();
    });

    it("should return corresponding account", () => {
      expect(
        getAccountFromStore({
          identifier: mockMainAccount.identifier,
          accounts,
        })
      ).toEqual(mockMainAccount);
      expect(
        getAccountFromStore({
          identifier: mockSubAccount.identifier,
          accounts,
        })
      ).toEqual(mockSubAccount);
    });
  });

  describe("getAccountByRootCanister", () => {
    const accounts = [mockMainAccount, mockSubAccount];
    const snsAccounts = {
      [mockPrincipal.toText()]: {
        accounts: [mockSnsMainAccount, mockSnsSubAccount],
        certified: true,
      },
    };

    it("should not return an account if no identifier is provided", () => {
      expect(
        getAccountByRootCanister({
          identifier: undefined,
          nnsAccounts: accounts,
          snsAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toBeUndefined();
    });

    it("should find no account if not matches", () => {
      expect(
        getAccountByRootCanister({
          identifier: "aaa",
          nnsAccounts: accounts,
          snsAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toBeUndefined();
    });

    it("should return corresponding nns account", () => {
      expect(
        getAccountByRootCanister({
          identifier: mockMainAccount.identifier,
          nnsAccounts: accounts,
          snsAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toEqual(mockMainAccount);
    });

    it("should return corresponding sns account", () => {
      expect(
        getAccountByRootCanister({
          identifier: mockSnsMainAccount.identifier,
          nnsAccounts: accounts,
          snsAccounts,
          rootCanisterId: mockPrincipal,
        })
      ).toEqual(mockSnsMainAccount);
    });
  });

  describe("getAccountsByRootCanister", () => {
    const accounts = [mockMainAccount, mockSubAccount];
    const snsAccounts = {
      [mockPrincipal.toText()]: {
        accounts: [mockSnsMainAccount, mockSnsSubAccount],
        certified: true,
      },
    };

    it("should return undefined if no accounts", () => {
      expect(
        getAccountsByRootCanister({
          nnsAccounts: accounts,
          snsAccounts,
          rootCanisterId: Principal.fromText("aaaaa-aa"),
        })
      ).toBeUndefined();
    });

    it("should return corresponding nns accounts", () => {
      expect(
        getAccountsByRootCanister({
          nnsAccounts: accounts,
          snsAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toEqual(accounts);
    });

    it("should return corresponding sns accounts", () => {
      expect(
        getAccountsByRootCanister({
          nnsAccounts: accounts,
          snsAccounts,
          rootCanisterId: mockPrincipal,
        })
      ).toEqual(snsAccounts[mockPrincipal.toText()].accounts);
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

  describe("accountName", () => {
    it("returns subAccount name", () => {
      expect(
        accountName({
          account: mockSubAccount,
          mainName: "main",
        })
      ).toBe(mockSubAccount.name);
    });

    it("returns main account name", () => {
      expect(
        accountName({
          account: mockMainAccount,
          mainName: "main",
        })
      ).toBe("main");
    });

    it('returns "" if no account', () => {
      expect(
        accountName({
          account: undefined,
          mainName: "main",
        })
      ).toBe("");
    });
  });
});
