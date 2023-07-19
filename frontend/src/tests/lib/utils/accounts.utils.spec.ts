import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { TransactionNetwork } from "$lib/types/transaction";
import {
  accountName,
  assertEnoughAccountFunds,
  emptyAddress,
  findAccount,
  getAccountByPrincipal,
  getAccountByRootCanister,
  getAccountsByRootCanister,
  getPrincipalFromString,
  hasAccounts,
  invalidAddress,
  invalidIcpAddress,
  invalidIcrcAddress,
  isAccountHardwareWallet,
  mainAccount,
  sumAccounts,
  sumNnsAccounts,
  toIcpAccountIdentifier,
} from "$lib/utils/accounts.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockAddressInputInvalid,
  mockAddressInputValid,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { AnonymousIdentity } from "@dfinity/agent";
import { encodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import {
  mockBTCAddressMainnet,
  mockBTCAddressTestnet,
} from "../../mocks/ckbtc-accounts.mock";

describe("accounts-utils", () => {
  const accounts = [mockMainAccount, mockSubAccount];

  const universesAccounts = {
    [OWN_CANISTER_ID.toText()]: accounts,
    [mockPrincipal.toText()]: [mockSnsMainAccount, mockSnsSubAccount],
  };

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

  describe("address", () => {
    const subaccount = new Uint8Array(32).fill(0);
    subaccount[31] = 1;
    const account = {
      owner: new AnonymousIdentity().getPrincipal(),
      subaccount: subaccount,
    };
    const subaccountString = encodeIcrcAccount(account);

    describe("invalidAddress", () => {
      it("should be an invalid address", () => {
        expect(
          invalidAddress({
            address: undefined,
            network: undefined,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
        expect(
          invalidAddress({
            address: "test",
            network: undefined,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
        expect(
          invalidAddress({
            address: mockAddressInputInvalid,
            network: undefined,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: undefined,
            network: TransactionNetwork.ICP,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
        expect(
          invalidAddress({
            address: "test",
            network: TransactionNetwork.ICP,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
        expect(
          invalidAddress({
            address: mockAddressInputInvalid,
            network: TransactionNetwork.ICP,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: undefined,
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
        expect(
          invalidAddress({
            address: "test",
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
        expect(
          invalidAddress({
            address: mockAddressInputInvalid,
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
      });

      it("should be a valid ICP address", () => {
        expect(
          invalidAddress({
            address: mockAddressInputValid,
            network: undefined,
            rootCanisterId: OWN_CANISTER_ID,
          })
        ).toBe(false);
        expect(
          invalidAddress({
            address: mockAddressInputValid,
            network: TransactionNetwork.ICP,
            rootCanisterId: OWN_CANISTER_ID,
          })
        ).toBe(false);
      });

      it("should return false for Icrc accounts", () => {
        expect(
          invalidAddress({
            address: subaccountString,
            network: undefined,
            rootCanisterId: mockCanisterId,
          })
        ).toBe(false);
        expect(
          invalidAddress({
            address: subaccountString,
            network: TransactionNetwork.ICP,
            rootCanisterId: mockCanisterId,
          })
        ).toBe(false);
      });

      it("should return false for BTC", () => {
        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: TransactionNetwork.BTC_TESTNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBe(false);
      });

      it("should not be a valid ICP address", () => {
        expect(
          invalidAddress({
            address: mockAddressInputValid,
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: OWN_CANISTER_ID,
          })
        ).toBeTruthy();
      });

      it("should not be a valid for Icrc accounts", () => {
        expect(
          invalidAddress({
            address: subaccountString,
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
      });

      it("should return invalid for BTC", () => {
        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: TransactionNetwork.ICP,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: undefined,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
      });
    });

    describe("invalidIcpAddress", () => {
      it("should be a invalid address", () => {
        expect(invalidIcpAddress(undefined)).toBeTruthy();
        expect(invalidIcpAddress("test")).toBeTruthy();
        expect(invalidIcpAddress(mockAddressInputInvalid)).toBeTruthy();
      });

      it("should be a valid ICP address", () => {
        expect(invalidIcpAddress(mockAddressInputValid)).toBe(false);
      });

      it("should return false for sns accounts", () => {
        expect(invalidIcpAddress(subaccountString)).toBeTruthy();
      });
    });

    describe("invalidIcrcAddress", () => {
      it("should be a invalid address", () => {
        expect(invalidIcrcAddress(undefined)).toBeTruthy();
        expect(invalidIcrcAddress("test")).toBeTruthy();
        expect(invalidIcrcAddress(mockAddressInputInvalid)).toBeTruthy();
      });

      it("should be a invalid ICP address", () => {
        expect(invalidIcrcAddress(mockAddressInputValid)).toBeTruthy();
      });

      it("should return false for sns accounts", () => {
        expect(invalidIcrcAddress(subaccountString)).toBe(false);
      });
    });

    describe("invalidBtcAddress", () => {
      it("should return false for BTC", () => {
        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: TransactionNetwork.BTC_TESTNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBe(false);

        expect(
          invalidAddress({
            address: mockBTCAddressMainnet,
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBe(false);
      });

      it("should return invalid for BTC", () => {
        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: TransactionNetwork.BTC_MAINNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: TransactionNetwork.ICP,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: mockBTCAddressTestnet,
            network: undefined,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: mockBTCAddressMainnet,
            network: TransactionNetwork.BTC_TESTNET,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: mockBTCAddressMainnet,
            network: TransactionNetwork.ICP,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();

        expect(
          invalidAddress({
            address: mockBTCAddressMainnet,
            network: undefined,
            rootCanisterId: mockCanisterId,
          })
        ).toBeTruthy();
      });
    });
  });

  describe("emptyAddress", () => {
    it("should be an empty address", () => {
      expect(emptyAddress(undefined)).toBeTruthy();
      expect(emptyAddress("")).toBeTruthy();
    });

    it("should not be an empty address", () => {
      expect(emptyAddress("test")).toBe(false);
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
      expect(isAccountHardwareWallet(mockMainAccount)).toBe(false);
      expect(isAccountHardwareWallet(mockSubAccount)).toBe(false);
    });

    it("returns false if no account", () => {
      expect(isAccountHardwareWallet(undefined)).toBe(false);
    });
  });

  describe("findAccount", () => {
    const accounts = [mockMainAccount, mockSubAccount];

    it("should not return an account if no identifier is provided", () => {
      expect(findAccount({ identifier: undefined, accounts })).toBeUndefined();
    });

    it("should find no account if not matches", () => {
      expect(findAccount({ identifier: "aaa", accounts })).toBeUndefined();
    });

    it("should return corresponding account", () => {
      expect(
        findAccount({
          identifier: mockMainAccount.identifier,
          accounts,
        })
      ).toEqual(mockMainAccount);
      expect(
        findAccount({
          identifier: mockSubAccount.identifier,
          accounts,
        })
      ).toEqual(mockSubAccount);
    });
  });

  describe("getAccountByRootCanister", () => {
    it("should not return an account if no identifier is provided", () => {
      expect(
        getAccountByRootCanister({
          identifier: undefined,
          universesAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toBeUndefined();
    });

    it("should find no account if not matches", () => {
      expect(
        getAccountByRootCanister({
          identifier: "aaa",
          universesAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toBeUndefined();
    });

    it("should return corresponding nns account", () => {
      expect(
        getAccountByRootCanister({
          identifier: mockMainAccount.identifier,
          universesAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toEqual(mockMainAccount);
    });

    it("should return corresponding sns account", () => {
      expect(
        getAccountByRootCanister({
          identifier: mockSnsMainAccount.identifier,
          universesAccounts,
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
          universesAccounts,
          rootCanisterId: Principal.fromText("aaaaa-aa"),
        })
      ).toBeUndefined();
    });

    it("should return corresponding nns accounts", () => {
      expect(
        getAccountsByRootCanister({
          universesAccounts,
          rootCanisterId: OWN_CANISTER_ID,
        })
      ).toEqual(accounts);
    });

    it("should return corresponding sns accounts", () => {
      expect(
        getAccountsByRootCanister({
          universesAccounts,
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
            balanceE8s: amountE8s,
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
            balanceE8s: amountE8s,
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

  describe("sumNnsAccounts", () => {
    it("should sum accounts balance", () => {
      let totalBalance =
        mockMainAccount.balanceE8s +
        mockSubAccount.balanceE8s +
        mockHardwareWalletAccount.balanceE8s;

      expect(
        sumNnsAccounts({
          main: mockMainAccount,
          subAccounts: [mockSubAccount],
          hardwareWallets: [mockHardwareWalletAccount],
        })
      ).toEqual(totalBalance);

      totalBalance = mockMainAccount.balanceE8s + mockSubAccount.balanceE8s;

      expect(
        sumNnsAccounts({
          main: mockMainAccount,
          subAccounts: [mockSubAccount],
          hardwareWallets: [],
        })
      ).toEqual(totalBalance);

      totalBalance = mockMainAccount.balanceE8s;

      expect(
        sumNnsAccounts({
          main: mockMainAccount,
          subAccounts: [],
          hardwareWallets: [],
        })
      ).toEqual(totalBalance);
    });
  });

  describe("sumAccounts", () => {
    it("should sum accounts balance", () => {
      let totalBalance =
        mockSnsMainAccount.balanceE8s + mockSnsSubAccount.balanceE8s;

      expect(sumAccounts([mockSnsMainAccount, mockSnsSubAccount])).toEqual(
        totalBalance
      );

      totalBalance = mockSnsMainAccount.balanceE8s;

      expect(sumAccounts([mockSnsMainAccount])).toEqual(totalBalance);
    });
  });

  describe("hasAccounts", () => {
    it("should have accounts", () =>
      expect(hasAccounts([mockMainAccount])).toBeTruthy());

    it("should not have accounts", () => expect(hasAccounts([])).toBe(false));
  });

  describe("toIcpAccountIdentifier", () => {
    it("should returns an icp account identifier for an icrc account identifier", () => {
      expect(toIcpAccountIdentifier(mockSnsMainAccount.identifier)).toEqual(
        "97783b7f0f34634c06ced774bd1bd27d2c76e80b0dd88f56ad55b3ecab292f68"
      );
    });

    it("should returns the account identifier parameter if not an icrc account identifier", () => {
      expect(toIcpAccountIdentifier(mockMainAccount.identifier)).toEqual(
        mockMainAccount.identifier
      );

      expect(toIcpAccountIdentifier("123456")).toEqual("123456");
    });
  });
});
