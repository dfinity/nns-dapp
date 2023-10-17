import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { formatToken } from "$lib/utils/token.utils";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import type { SpyInstance } from "vitest";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/icp-ledger.api");

describe("NnsAccounts", () => {
  beforeEach(() => {
    resetIdentity();
  });

  afterEach(() => vi.clearAllMocks());

  describe("when there are accounts", () => {
    beforeEach(() => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [],
        hardwareWallets: [],
        certified: true,
      });
      cancelPollAccounts();
    });

    it("should render a main card", () => {
      const { queryByTestId } = render(NnsAccounts);

      expect(queryByTestId("account-card")).not.toBeNull();
    });

    it("should render account icp in card too", () => {
      const { container } = render(NnsAccounts);

      const cardTitleRow = container.querySelector(
        '[data-tid="account-card"] > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatToken({ value: mockMainAccount.balanceE8s })} ICP`
      );
    });

    it("should render account identifier", () => {
      const { getByText } = render(NnsAccounts);
      getByText(mockMainAccount.identifier);
    });

    it("should render subaccount cards", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [],
        certified: true,
      });
      const { queryAllByTestId } = render(NnsAccounts);

      const cards = queryAllByTestId("account-card");

      expect(cards).not.toBeNull();
      expect(cards.length).toBe(2);
    });

    it("should render hardware wallet account cards", () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [],
        hardwareWallets: [mockHardwareWalletAccount],
        certified: true,
      });
      const { queryAllByTestId } = render(NnsAccounts);

      const cards = queryAllByTestId("account-card");

      expect(cards).not.toBeNull();
      expect(cards.length).toBe(2);
    });
  });

  describe("summary", () => {
    beforeAll(() => {
      vi.clearAllMocks();
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
        certified: true,
      });
    });

    it("should contain a tooltip", () => {
      const { container } = render(NnsAccounts);

      expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
    });
  });

  describe("when no accounts", () => {
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      const mainBalanceE8s = BigInt(10_000_000);
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
    });
    it("should not render a token amount component nor zero", () => {
      const { container } = render(NnsAccounts);

      // The tooltip wraps the total amount
      expect(
        container.querySelector(".tooltip-wrapper")
      ).not.toBeInTheDocument();
    });

    it("should load accounts", async () => {
      const { queryByTestId } = render(NnsAccounts);

      expect(queryByTestId("account-card")).toBeNull();

      await waitFor(() => expect(queryByTestId("account-card")).not.toBeNull());
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: SpyInstance;
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      vi.clearAllTimers();
      vi.clearAllMocks();
      cancelPollAccounts();
      const now = Date.now();
      vi.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = BigInt(10_000_000);
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      spyQueryAccount = vi
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should stop polling", async () => {
      const { unmount } = render(NnsAccounts);

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
