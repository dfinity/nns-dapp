import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { icpTokensListUser } from "$lib/derived/icp-tokens-list-user.derived";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
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
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
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
  const mainAccountHref = buildWalletUrl({
    universe: OWN_CANISTER_ID_TEXT,
  });
  const loadingUserTokenData: UserTokenLoading = {
    ...icpTokenBase,
    title: "Main",
    balance: "loading",
    actions: [],
    rowHref: mainAccountHref,
    domKey: mainAccountHref,
  };
  const mainUserTokenData: UserTokenData = {
    ...icpTokenUser,
    balance: TokenAmountV2.fromUlps({
      amount: mockMainAccount.balanceUlps,
      token: NNS_TOKEN_DATA,
    }),
    title: "Main",
    subtitle: undefined,
    rowHref: mainAccountHref,
    domKey: mainAccountHref,
    accountIdentifier: mockMainAccount.identifier,
  };
  const subaccountUserTokenData = (
    balanceUlps: bigint = mockSubAccount.balanceUlps
  ): UserTokenData => {
    // Use balance (when explicitly provided) as identifier to have unique sub-accounts
    const accountIdentifier =
      balanceUlps === mockSubAccount.balanceUlps
        ? mockSubAccount.identifier
        : `${balanceUlps}`;
    const subaccountHref = buildWalletUrl({
      universe: OWN_CANISTER_ID_TEXT,
      account: accountIdentifier,
    });
    return {
      ...icpTokenUser,
      balance: TokenAmountV2.fromUlps({
        amount: balanceUlps,
        token: NNS_TOKEN_DATA,
      }),
      title: mockSubAccount.name,
      subtitle: undefined,
      rowHref: subaccountHref,
      domKey: subaccountHref,
      accountIdentifier,
    };
  };
  const hardwareWalletUserTokenData = (
    balanceUlps: bigint = mockHardwareWalletAccount.balanceUlps
  ): UserTokenData => {
    // Use balance (when explicitly provided) as identifier to have unique sub-accounts
    const accountIdentifier =
      balanceUlps === mockHardwareWalletAccount.balanceUlps
        ? mockHardwareWalletAccount.identifier
        : `${balanceUlps}`;
    const hwHref = buildWalletUrl({
      universe: OWN_CANISTER_ID_TEXT,
      account: accountIdentifier,
    });
    return {
      ...icpTokenUser,
      balance: TokenAmountV2.fromUlps({
        amount: balanceUlps,
        token: NNS_TOKEN_DATA,
      }),
      title: mockHardwareWalletAccount.name,
      subtitle: "Ledger Device Controlled",
      rowHref: hwHref,
      domKey: hwHref,
      accountIdentifier,
    };
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
        subaccountUserTokenData(),
      ]);
    });

    it("should return Ledger devices, subaccounts and main", () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      expect(get(icpTokensListUser)).toEqual([
        mainUserTokenData,
        subaccountUserTokenData(),
        hardwareWalletUserTokenData(),
      ]);
    });

    it("should include balance in USD if ICP Swap data is loaded", () => {
      const mainAccountBalance = 7;
      const subAccountBalance = 5;
      const hwAccountBalance = 3;
      const icpPrice = 10;

      icpSwapTickersStore.set([
        {
          ...mockIcpSwapTicker,
          base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
          last_price: String(icpPrice),
        },
      ]);

      setAccountsForTesting({
        main: {
          ...mockMainAccount,
          balanceUlps: BigInt(mainAccountBalance * E8S_PER_ICP),
        },
        subAccounts: [
          {
            ...mockSubAccount,
            balanceUlps: BigInt(subAccountBalance * E8S_PER_ICP),
          },
        ],
        hardwareWallets: [
          {
            ...mockHardwareWalletAccount,
            balanceUlps: BigInt(hwAccountBalance * E8S_PER_ICP),
          },
        ],
      });
      expect(get(icpTokensListUser)).toEqual([
        {
          ...mainUserTokenData,
          balance: TokenAmountV2.fromUlps({
            amount: BigInt(mainAccountBalance * E8S_PER_ICP),
            token: NNS_TOKEN_DATA,
          }),
          balanceInUsd: mainAccountBalance * icpPrice,
        },
        {
          ...subaccountUserTokenData(),
          balance: TokenAmountV2.fromUlps({
            amount: BigInt(subAccountBalance * E8S_PER_ICP),
            token: NNS_TOKEN_DATA,
          }),
          balanceInUsd: subAccountBalance * icpPrice,
        },
        {
          ...hardwareWalletUserTokenData(),
          balance: TokenAmountV2.fromUlps({
            amount: BigInt(hwAccountBalance * E8S_PER_ICP),
            token: NNS_TOKEN_DATA,
          }),
          balanceInUsd: hwAccountBalance * icpPrice,
        },
      ]);
    });

    it("should include balance in USD if balance is 0 but ICP Swap data is not loaded", () => {
      const mainAccountBalance = 0;
      const subAccountBalance = 0;
      const hwAccountBalance = 0;

      setAccountsForTesting({
        main: {
          ...mockMainAccount,
          balanceUlps: BigInt(mainAccountBalance * E8S_PER_ICP),
        },
        subAccounts: [
          {
            ...mockSubAccount,
            balanceUlps: BigInt(subAccountBalance * E8S_PER_ICP),
          },
        ],
        hardwareWallets: [
          {
            ...mockHardwareWalletAccount,
            balanceUlps: BigInt(hwAccountBalance * E8S_PER_ICP),
          },
        ],
      });
      expect(get(icpTokensListUser)).toEqual([
        {
          ...mainUserTokenData,
          balance: TokenAmountV2.fromUlps({
            amount: BigInt(mainAccountBalance * E8S_PER_ICP),
            token: NNS_TOKEN_DATA,
          }),
          balanceInUsd: mainAccountBalance,
        },
        {
          ...subaccountUserTokenData(),
          balance: TokenAmountV2.fromUlps({
            amount: BigInt(subAccountBalance * E8S_PER_ICP),
            token: NNS_TOKEN_DATA,
          }),
          balanceInUsd: subAccountBalance,
        },
        {
          ...hardwareWalletUserTokenData(),
          balance: TokenAmountV2.fromUlps({
            amount: BigInt(hwAccountBalance * E8S_PER_ICP),
            token: NNS_TOKEN_DATA,
          }),
          balanceInUsd: hwAccountBalance,
        },
      ]);
    });

    it("should sort user tokens", () => {
      const subAccount1 = {
        ...mockSubAccount,
        identifier: "1",
        balanceUlps: 1n,
      };
      const subAccount5 = {
        ...mockSubAccount,
        identifier: "5",
        balanceUlps: 5n,
      };
      const hwAccount3 = {
        ...mockHardwareWalletAccount,
        identifier: "3",
        balanceUlps: 3n,
      };
      const hwAccount7 = {
        ...mockHardwareWalletAccount,
        identifier: "7",
        balanceUlps: 7n,
      };
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [subAccount5, subAccount1],
        hardwareWallets: [hwAccount3, hwAccount7],
      });

      expect(get(icpTokensListUser)).toEqual([
        mainUserTokenData,
        hardwareWalletUserTokenData(7n),
        subaccountUserTokenData(5n),
        hardwareWalletUserTokenData(3n),
        subaccountUserTokenData(1n),
      ]);
    });
  });
});
