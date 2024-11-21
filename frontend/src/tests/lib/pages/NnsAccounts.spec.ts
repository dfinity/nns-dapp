import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import type { UserTokenData } from "$lib/types/tokens-page";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import { createUserToken } from "$tests/mocks/tokens-page.mock";
import { NnsAccountsPo } from "$tests/page-objects/NnsAccounts.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetAccountsForTesting } from "$tests/utils/accounts.test-utils";
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
    resetAccountsForTesting();
    // TODO: Move the pollAccounts to Accounts route when universe selected is NNS instead of the child.
    vi.spyOn(nnsDappApi, "queryAccount").mockImplementation(async () => {
      return mockAccountDetails;
    });
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
  });

  // TODO: Move the pollAccounts to Accounts route when universe selected is NNS instead of the child.
  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: MockInstance;
    beforeEach(() => {
      vi.clearAllTimers();
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
