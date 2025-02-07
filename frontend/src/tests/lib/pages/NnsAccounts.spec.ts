import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import type { UserTokenData } from "$lib/types/tokens-page";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import { createUserToken } from "$tests/mocks/tokens-page.mock";
import { NnsAccountsPo } from "$tests/page-objects/NnsAccounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import type { MockInstance } from "vitest";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/icp-ledger.api");

describe("NnsAccounts", () => {
  const renderComponent = (userTokensData: UserTokenData[] = []) => {
    const { container } = render(NnsAccounts, { props: { userTokensData } });
    return NnsAccountsPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
    // TODO: Move the pollAccounts to Accounts route when universe selected is NNS instead of the child.
    vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(async () => {
      return mockAccountDetails;
    });

    setIcpPrice(10);
  });

  describe("when tokens flag is enabled", () => {
    it("renders 'Accounts' as tokens table first column", async () => {
      const po = renderComponent([]);

      const tablePo = po.getTokensTablePo();
      expect(await tablePo.getFirstColumnHeader()).toEqual("Accounts");
    });

    it("should render tokens table with rows", async () => {
      const mainTokenData = createUserToken({
        title: "Main",
        balance: TokenAmount.fromE8s({
          amount: 314000000n,
          token: NNS_TOKEN_DATA,
        }),
        rowHref: "/main",
        domKey: "/main",
      });
      const subaccountTokenData = createUserToken({
        title: "Subaccount test",
        balance: TokenAmount.fromE8s({
          amount: 222000000n,
          token: NNS_TOKEN_DATA,
        }),
        rowHref: "/subaccount",
        domKey: "/subaccount",
      });
      const po = renderComponent([mainTokenData, subaccountTokenData]);
      expect(await po.getTokensTablePo().getRowsData()).toEqual([
        {
          balance: "3.14 ICP",
          projectName: "Main",
        },
        {
          balance: "2.22 ICP",
          projectName: "Subaccount test",
        },
      ]);
    });

    it("should render add account row with tabindex 0", async () => {
      const mainTokenData = createUserToken({
        title: "Main",
        balance: TokenAmount.fromE8s({
          amount: 314000000n,
          token: NNS_TOKEN_DATA,
        }),
        rowHref: "/main",
        domKey: "/main",
      });
      const subaccountTokenData = createUserToken({
        title: "Subaccount test",
        balance: TokenAmount.fromE8s({
          amount: 222000000n,
          token: NNS_TOKEN_DATA,
        }),
        rowHref: "/subaccount",
        domKey: "/subaccount",
      });
      const po = renderComponent([mainTokenData, subaccountTokenData]);
      expect(await po.getAddAccountRowTabindex()).toBe("0");
    });

    it("should not show total USD value banner when feature flag is disabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES", false);

      const mainTokenData = createUserToken({
        title: "Main",
        balanceInUsd: 30.0,
        rowHref: "/main",
        domKey: "/main",
      });

      const po = renderComponent([mainTokenData]);

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(false);
    });

    it("should show total USD value banner when feature flag is enabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES", true);

      const mainTokenData = createUserToken({
        title: "Main",
        balanceInUsd: 30.0,
        rowHref: "/main",
        domKey: "/main",
      });

      const po = renderComponent([mainTokenData]);

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
    });

    it("should show total USD value", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES", true);

      const mainTokenData = createUserToken({
        title: "Main",
        balanceInUsd: 30.0,
        rowHref: "/main",
        domKey: "/main",
      });
      const subaccountTokenData = createUserToken({
        title: "Subaccount test",
        balanceInUsd: 20.0,
        rowHref: "/subaccount",
        domKey: "/subaccount",
      });
      const po = renderComponent([mainTokenData, subaccountTokenData]);

      expect(await po.getUsdValueBannerPo().isPresent()).toBe(true);
      expect(await po.getUsdValueBannerPo().getPrimaryAmount()).toBe("$50.00");
      expect(
        await po.getUsdValueBannerPo().getTotalsTooltipIconPo().isPresent()
      ).toBe(false);
    });

    it("should not allow sorting", async () => {
      const po = renderComponent([]);

      expect(await po.getTokensTablePo().getColumnHeaderWithArrow()).toBe(
        undefined
      );
      expect(
        await po.getTokensTablePo().getOpenSortModalButtonPo().isPresent()
      ).toBe(false);
    });
  });

  // TODO: Move the pollAccounts to Accounts route when universe selected is NNS instead of the child.
  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: MockInstance;
    beforeEach(() => {
      cancelPollAccounts();
      const now = Date.now();
      vi.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = 10_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      spyQueryAccount = vi
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should stop polling", async () => {
      const { unmount } = render(NnsAccounts, {
        props: { userTokensData: [] },
      });

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);

      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      const callsBeforeLeaving = 3;
      while (expectedCalls < callsBeforeLeaving) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
      }
      unmount();

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(spyQueryAccount).toBeCalledTimes(expectedCalls);
    });
  });
});
