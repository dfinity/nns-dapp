/**
 * @jest-environment jsdom
 */

import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import NnsWallet from "$lib/pages/NnsWallet.svelte";
import { cancelPollAccounts } from "$lib/services/accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  modalToolbarSelector,
  waitModalIntroEnd,
} from "$tests/mocks/modal.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { ICPToken } from "@dfinity/utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import AccountsTest from "./AccountsTest.svelte";

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/accounts.api");
jest.mock("$lib/api/icp-ledger.api");

const blockedApiPaths = [
  "$lib/api/nns-dapp.api",
  "$lib/api/accounts.api",
  "$lib/api/icp-ledger.api",
];

describe("NnsWallet", () => {
  blockAllCallsTo(blockedApiPaths);

  const props = {
    accountIdentifier: mockMainAccount.identifier,
  };
  const mainBalanceE8s = BigInt(10_000_000);

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
    jest
      .spyOn(ledgerApi, "queryAccountBalance")
      .mockResolvedValue(mainBalanceE8s);
    jest.spyOn(accountsApi, "getTransactions").mockResolvedValue([]);
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
      cancelPollAccounts();
      icpAccountsStore.resetForTesting();
      jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
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

      expect(queryByTestId("projects-summary")).toBeNull();

      await waitFor(() =>
        expect(queryByTestId("projects-summary")).toBeInTheDocument()
      );
    });
  });

  describe("accounts loaded", () => {
    beforeAll(() => {
      jest.clearAllMocks();
      icpAccountsStore.setForTesting(mockAccountsStoreData);
    });

    it("should render nns project name", async () => {
      const { getByTestId } = render(NnsWallet, props);

      const titleRow = getByTestId("projects-summary");

      expect(titleRow).not.toBeNull();
    });

    it("should render a balance with token in summary", async () => {
      const { getByTestId } = render(NnsWallet, props);

      await waitFor(() =>
        expect(getByTestId("token-value-label")).not.toBeNull()
      );

      expect(getByTestId("token-value-label")?.textContent.trim()).toEqual(
        `${formatToken({
          value: mockMainAccount.balanceE8s,
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

      await waitFor(expect(getByTestId("receive-modal")).not.toBeNull);

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() =>
        expect(accountsApi.getTransactions).toBeCalledTimes(4)
      );
      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(2);
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

    afterAll(() => jest.clearAllMocks());

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
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: jest.SpyInstance;
    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      jest.clearAllTimers();
      jest.clearAllMocks();
      cancelPollAccounts();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spyQueryAccount = jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      jest.spyOn(console, "error").mockImplementation(() => undefined);
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
