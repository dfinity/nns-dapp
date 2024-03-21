import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { icpTokensListUser } from "$lib/derived/icp-tokens-list-user.derived";
import {
  UserTokenAction,
  type UserTokenData,
  type UserTokenLoading,
} from "$lib/types/tokens-page";
import { buildWalletUrl } from "$lib/utils/navigation.utils";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  createIcpUserToken,
  icpTokenBase,
} from "$tests/mocks/tokens-page.mock";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { TokenAmountV2 } from "@dfinity/utils";
import { get } from "svelte/store";

describe("icp-tokens-list-user.derived", () => {
  const icpTokenUser: UserTokenData = createIcpUserToken({
    actions: [UserTokenAction.Receive, UserTokenAction.Send],
  });
  const loadingUserTokenData: UserTokenLoading = {
    ...icpTokenBase,
    title: "Main",
    balance: "loading",
    actions: [],
    rowHref: buildWalletUrl({
      universe: OWN_CANISTER_ID_TEXT,
    }),
  };
  const mainUserTokenData: UserTokenData = {
    ...icpTokenUser,
    balance: TokenAmountV2.fromUlps({
      amount: mockMainAccount.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    title: "Main",
    subtitle: undefined,
    rowHref: buildWalletUrl({
      universe: OWN_CANISTER_ID_TEXT,
      account: mockMainAccount.identifier,
    }),
    accountIdentifier: mockMainAccount.identifier,
  };
  const subaccountUserTokenData: UserTokenData = {
    ...icpTokenUser,
    balance: TokenAmountV2.fromUlps({
      amount: mockSubAccount.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    title: mockSubAccount.name,
    subtitle: undefined,
    rowHref: buildWalletUrl({
      universe: OWN_CANISTER_ID_TEXT,
      account: mockSubAccount.identifier,
    }),
    accountIdentifier: mockSubAccount.identifier,
  };
  const hardwareWalletUserTokenData: UserTokenData = {
    ...icpTokenUser,
    balance: TokenAmountV2.fromUlps({
      amount: mockHardwareWalletAccount.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    title: mockHardwareWalletAccount.name,
    subtitle: "Hardware Wallet Controlled",
    rowHref: buildWalletUrl({
      universe: OWN_CANISTER_ID_TEXT,
      account: mockHardwareWalletAccount.identifier,
    }),
    accountIdentifier: mockHardwareWalletAccount.identifier,
  };

  describe("icpTokensListVisitors", () => {
    beforeEach(() => {
      resetAccountsForTesting();
    });

    it("should return empty if no accounts", () => {
      expect(get(icpTokensListUser)).toEqual([loadingUserTokenData]);
    });

    it("should return only main if no subaccounts and no subaccounts", () => {
      setAccountsForTesting({
        main: mockMainAccount,
      });
      expect(get(icpTokensListUser)).toEqual([mainUserTokenData]);
    });

    it("should return subaccounts and main", () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      expect(get(icpTokensListUser)).toEqual([
        mainUserTokenData,
        subaccountUserTokenData,
      ]);
    });

    it("should return hardware wallets, subaccounts and main", () => {
      setAccountsForTesting({
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
