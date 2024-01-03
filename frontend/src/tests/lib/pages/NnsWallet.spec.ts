import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import NnsWallet from "$lib/pages/NnsWallet.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatTokenE8s } from "$lib/utils/token.utils";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { ICPToken } from "@dfinity/utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import type { SpyInstance } from "vitest";
import AccountsTest from "./AccountsTest.svelte";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/accounts.api");
vi.mock("$lib/api/icp-ledger.api");

describe("NnsWallet", () => {
  const props = {
    accountIdentifier: mockMainAccount.identifier,
  };
  const mainBalanceE8s = 10_000_000n;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    cancelPollAccounts();
    icpAccountsStore.resetForTesting();

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
      mainBalanceE8s
    );
    vi.spyOn(accountsApi, "getTransactions").mockResolvedValue([]);
  });

  const testToolbarButton = ({
    container,
    disabled,
  }: {
    container: HTMLElement;
    disabled: boolean;
  }) => {
    const button = container.querySelector("footer div.toolbar button");

    expect(button).not.toBeNull();
    expect((button as HTMLButtonElement).hasAttribute("disabled")).toEqual(
      disabled
    );
  };

  describe("no accounts", () => {
    beforeEach(() => {
      vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
    });

    it("should render a spinner while loading", () => {
      const { getByTestId } = render(NnsWallet);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("new transaction action should be disabled while loading", () => {
      const { container } = render(NnsWallet);

      testToolbarButton({ container, disabled: true });
    });

    it("new transaction should remain disabled if route is valid but store is not loaded", async () => {
      const { container } = render(NnsWallet, props);

      // init
      testToolbarButton({ container, disabled: true });

      await tick();

      // route set triggers get account
      testToolbarButton({ container, disabled: true });
    });

    it("should show new accounts after being loaded", async () => {
      const { queryByTestId } = render(NnsWallet, props);

      expect(queryByTestId("wallet-page-heading-component")).toBeNull();

      await waitFor(() =>
        expect(
          queryByTestId("wallet-page-heading-component")
        ).toBeInTheDocument()
      );
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      icpAccountsStore.setForTesting(mockAccountsStoreData);
    });

    it("should render nns project name", async () => {
      const { getByTestId } = render(NnsWallet, props);

      const titleRow = getByTestId("universe-page-summary-component");

      expect(titleRow.textContent.trim()).toBe("Internet Computer");
    });

    it("should render a balance with token in summary", async () => {
      const { getByTestId } = render(NnsWallet, props);

      await waitFor(() =>
        expect(getByTestId("token-value-label")).not.toBeNull()
      );

      expect(getByTestId("token-value-label")?.textContent.trim()).toEqual(
        `${formatTokenE8s({
          value: mockMainAccount.balanceUlps,
        })} ${ICPToken.symbol}`
      );
    });

    it("should enable new transaction action for route and store", async () => {
      const { container } = render(NnsWallet, props);

      await waitFor(() => testToolbarButton({ container, disabled: false }));
    });

    const modalProps = {
      ...props,
      testComponent: NnsWallet,
    };

    it("should open transaction modal", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await testAccountsModal({ result, testId: "new-transaction" });
    });

    it("should open transaction modal on step select destination because selected account is current account", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await testAccountsModal({ result, testId: "new-transaction" });

      const { getByTestId } = result;

      await waitFor(() =>
        expect(getByTestId("transaction-step-1")).toBeInTheDocument()
      );
    });

    it("should display SkeletonCard while loading transactions", async () => {
      const { getByTestId } = render(NnsWallet, props);

      expect(getByTestId("skeleton-card")).toBeInTheDocument();
    });

    it("should open receive modal", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await testAccountsModal({ result, testId: "receive-icp" });

      const { getByTestId } = result;

      expect(getByTestId("receive-modal")).not.toBeNull();
    });

    it("should display receive modal information", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await testAccountsModal({ result, testId: "receive-icp" });

      const { getByText } = result;

      expect(
        getByText(
          replacePlaceholders(en.wallet.token_address, {
            $tokenSymbol: en.core.icp,
          })
        )
      ).toBeInTheDocument();
    });

    it("should reload account after finish receiving tokens", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await testAccountsModal({ result, testId: "receive-icp" });

      const { getByTestId, container } = result;

      await waitModalIntroEnd({ container, selector: modalToolbarSelector });

      await waitFor(() =>
        expect(accountsApi.getTransactions).toBeCalledTimes(2)
      );
      expect(ledgerApi.queryAccountBalance).not.toBeCalled();

      await waitFor(() => expect(getByTestId("receive-modal")).not.toBeNull());

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() =>
        expect(accountsApi.getTransactions).toBeCalledTimes(4)
      );
      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(2);
    });
  });

  describe("accounts loaded (Subaccount)", () => {
    beforeEach(() => {
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        subAccounts: [mockSubAccount],
      });
    });

    const props = {
      accountIdentifier: mockSubAccount.identifier,
    };

    it("should Rename button", async () => {
      const { queryByTestId } = render(NnsWallet, props);
      expect(
        queryByTestId("open-rename-subaccount-button")
      ).toBeInTheDocument();
    });
  });

  describe("accounts loaded (Hardware Wallet)", () => {
    beforeEach(() => {
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        hardwareWallets: [mockHardwareWalletAccount],
      });
    });

    const props = {
      accountIdentifier: mockHardwareWalletAccount.identifier,
    };

    afterAll(() => {
      vi.clearAllMocks();
    });

    it("should display principal", async () => {
      const { queryByText } = render(NnsWallet, props);
      const principal = mockHardwareWalletAccount?.principal?.toString();

      expect(principal?.length).toBeGreaterThan(0);
      expect(
        queryByText(`${principal}`, {
          exact: false,
        })
      ).toBeInTheDocument();
    });

    it("should display hardware wallet buttons", async () => {
      const { queryByTestId } = render(NnsWallet, props);
      expect(queryByTestId("ledger-list-button")).toBeInTheDocument();
      expect(queryByTestId("ledger-show-button")).toBeInTheDocument();
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: SpyInstance;
    beforeEach(() => {
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
      const { unmount } = render(NnsWallet, { props });

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
