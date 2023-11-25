import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { icpTokensListUser } from "$lib/derived/icp-tokens-list-user.derived";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { createIcpUserToken } from "$tests/mocks/tokens-page.mock";
import { TokenAmount } from "@dfinity/utils";
import { get } from "svelte/store";

describe("icp-tokens-list-user.derived", () => {
  const icpTokenUser: UserTokenData = createIcpUserToken({
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  });
  const emptyUserTokenData: UserTokenData = {
    ...icpTokenUser,
    title: "Internet Computer",
    subtitle: undefined,
    actions: [],
  };
  const mainUserTokenData: UserTokenData = {
    ...icpTokenUser,
    balance: TokenAmount.fromE8s({
      amount: mockMainAccount.balanceE8s,
      token: NNS_TOKEN_DATA,
    }),
    title: "Main",
    subtitle: undefined,
  };
  const subaccountUserTokenData: UserTokenData = {
    ...icpTokenUser,
    balance: TokenAmount.fromE8s({
      amount: mockSubAccount.balanceE8s,
      token: NNS_TOKEN_DATA,
    }),
    title: mockSubAccount.name,
    subtitle: "Linked Account",
  };
  const hardwareWalletUserTokenData: UserTokenData = {
    ...icpTokenUser,
    balance: TokenAmount.fromE8s({
      amount: mockHardwareWalletAccount.balanceE8s,
      token: NNS_TOKEN_DATA,
    }),
    title: mockHardwareWalletAccount.name,
    subtitle: "Hardware Wallet",
  };

  describe("icpTokensListVisitors", () => {
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
    });

    it("should return empty if no accounts", () => {
      expect(get(icpTokensListUser)).toEqual([emptyUserTokenData]);
    });

    it("should return only main if no subaccounts and no subaccounts", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
      });
      expect(get(icpTokensListUser)).toEqual([mainUserTokenData]);
    });

    it("should return subaccounts and main", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      expect(get(icpTokensListUser)).toEqual([
        mainUserTokenData,
        subaccountUserTokenData,
      ]);
    });

    it("should return hardware wallets, subaccounts and main", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      expect(get(icpTokensListUser)).toEqual([
        mainUserTokenData,
        subaccountUserTokenData,
        hardwareWalletUserTokenData,
      ]);
    });
  });
});
