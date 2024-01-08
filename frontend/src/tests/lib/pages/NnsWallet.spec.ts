import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import type { Transaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import NnsWallet from "$lib/pages/NnsWallet.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { IcpTransactionModalPo } from "$tests/page-objects/IcpTransactionModal.page-object";
import { NnsWalletPo } from "$tests/page-objects/NnsWallet.page-object";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";
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
    toastsStore.reset();

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
    vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
      mainBalanceE8s
    );
    vi.spyOn(accountsApi, "getTransactions").mockResolvedValue([]);

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Wallet,
    });
  });

  const renderWallet = async (props) => {
    const { container } = render(NnsWallet, props);
    await runResolvedPromises();
    return NnsWalletPo.under(new JestPageObjectElement(container));
  };

  const renderWalletAndModals = async (
    props
  ): Promise<{
    walletPo: NnsWalletPo;
    transactionModalPo: IcpTransactionModalPo;
    receiveModalPo: ReceiveModalPo;
  }> => {
    const { container } = render(AccountsTest, props);
    await runResolvedPromises();
    return {
      walletPo: NnsWalletPo.under(new JestPageObjectElement(container)),
      transactionModalPo: IcpTransactionModalPo.under(
        new JestPageObjectElement(container)
      ),
      receiveModalPo: ReceiveModalPo.under(
        new JestPageObjectElement(container)
      ),
    };
  };

  const pauseQueryAccountBalance = () => {
    let resolveQueryBalance;
    vi.spyOn(ledgerApi, "queryAccountBalance").mockImplementation(
      () =>
        new Promise<bigint>((resolve) => {
          resolveQueryBalance = () => resolve(mainBalanceE8s);
        })
    );
    return () => resolveQueryBalance();
  };

  const pauseGetTransactions = () => {
    let resolveGetTransactions;
    vi.spyOn(accountsApi, "getTransactions").mockImplementation(
      () =>
        new Promise<Transaction[]>((resolve) => {
          resolveGetTransactions = () => resolve([]);
        })
    );
    return () => resolveGetTransactions();
  };

  describe("no accounts", () => {
    beforeEach(() => {
      vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
    });

    it("should render a spinner while loading", async () => {
      const resolveQueryAccount = pauseQueryAccountBalance();
      const po = await renderWallet({});

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(true);

      resolveQueryAccount();

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(false);
    });

    it("new transaction should remain disabled if route is valid but store is not loaded", async () => {
      const resolveQueryBalance = pauseQueryAccountBalance();
      const po = await renderWallet(props);

      await runResolvedPromises();
      expect(await po.getSendButtonPo().isDisabled()).toBe(true);

      resolveQueryBalance();

      await runResolvedPromises();
      expect(await po.getSendButtonPo().isDisabled()).toBe(false);
    });

    it("should show new accounts after being loaded", async () => {
      const resolveQueryBalance = pauseQueryAccountBalance();
      const po = await renderWallet(props);

      await runResolvedPromises();
      expect(await po.getWalletPageHeadingPo().isPresent()).toBe(false);

      resolveQueryBalance();

      await runResolvedPromises();
      expect(await po.getWalletPageHeadingPo().isPresent()).toBe(true);
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      icpAccountsStore.setForTesting(mockAccountsStoreData);
    });

    it("should render nns project name", async () => {
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe(
        "Internet Computer"
      );
    });

    it("should render a balance with token in summary", async () => {
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        main: {
          ...mockMainAccount,
          balanceUlps: 432_100_000n,
        },
      });
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("4.32 ICP");
    });

    it("should enable new transaction action for route and store", async () => {
      const po = await renderWallet(props);

      expect(await po.getSendButtonPo().isDisabled()).toBe(false);
    });

    const modalProps = {
      ...props,
      testComponent: NnsWallet,
    };

    it("should open transaction modal", async () => {
      const { walletPo, transactionModalPo } =
        await renderWalletAndModals(modalProps);
      expect(await transactionModalPo.isPresent()).toBe(false);
      await walletPo.clickSend();
      expect(await transactionModalPo.isPresent()).toBe(true);
    });

    it("should open transaction modal on step select destination because selected account is current account", async () => {
      const { walletPo, transactionModalPo } =
        await renderWalletAndModals(modalProps);
      await walletPo.clickSend();
      expect(await transactionModalPo.getTransactionFormPo().isPresent()).toBe(
        true
      );
    });

    it("should display SkeletonCard while loading transactions", async () => {
      const resolveGetTransactions = pauseGetTransactions();
      const po = await renderWallet(props);

      await runResolvedPromises();
      expect(
        await po.getTransactionListPo().getSkeletonCardPo().isPresent()
      ).toBe(true);

      resolveGetTransactions();

      await runResolvedPromises();
      expect(
        await po.getTransactionListPo().getSkeletonCardPo().isPresent()
      ).toBe(false);
    });

    it("should open receive modal", async () => {
      const { walletPo, receiveModalPo } =
        await renderWalletAndModals(modalProps);

      expect(await receiveModalPo.isPresent()).toBe(false);
      await walletPo.clickReceive();
      expect(await receiveModalPo.isPresent()).toBe(true);
    });

    it("should display receive modal information", async () => {
      const { walletPo, receiveModalPo } =
        await renderWalletAndModals(modalProps);

      await walletPo.clickReceive();
      expect(await receiveModalPo.getTokenAddressLabel()).toBe("ICP Address");
    });

    it("should reload account after finish receiving tokens", async () => {
      const { walletPo, receiveModalPo } =
        await renderWalletAndModals(modalProps);

      await walletPo.clickReceive();

      expect(accountsApi.getTransactions).toBeCalledTimes(2);
      expect(ledgerApi.queryAccountBalance).not.toBeCalled();

      await receiveModalPo.clickFinish();

      expect(accountsApi.getTransactions).toBeCalledTimes(4);
      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(2);
    });

    it("should navigate to accounts when account identifier is missing", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: OWN_CANISTER_ID_TEXT,
      });
      const po = await renderWallet({
        accountIdentifier: undefined,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: OWN_CANISTER_ID_TEXT,
      });
      expect(get(toastsStore)).toEqual([]);

      expect(await po.getWalletPageHeaderPo().getWalletAddress()).toBe(
        mockMainAccount.identifier
      );
    });

    it("should navigate to accounts when account identifier is invalid", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: OWN_CANISTER_ID_TEXT,
      });
      await renderWallet({
        accountIdentifier: "invalid-account-identifier",
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: OWN_CANISTER_ID_TEXT,
      });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: 'Sorry, the account "invalid-account-identifier" was not found',
        },
      ]);
    });

    it("should stay on the wallet page when account identifier is valid", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: OWN_CANISTER_ID_TEXT,
      });
      await renderWallet({
        accountIdentifier: mockMainAccount.identifier,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: OWN_CANISTER_ID_TEXT,
      });
      expect(get(toastsStore)).toEqual([]);
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
      const po = await renderWallet(props);

      expect(await po.getRenameButtonPo().isPresent()).toBe(true);
    });
  });

  describe("accounts loaded (Hardware Wallet)", () => {
    const testHwPrincipalText = "5dstn-f5lvo-v2xk5-lvmja-g";
    const testHwPrincipal = Principal.fromText(testHwPrincipalText);

    beforeEach(() => {
      icpAccountsStore.setForTesting({
        ...mockAccountsStoreData,
        hardwareWallets: [
          {
            ...mockHardwareWalletAccount,
            principal: testHwPrincipal,
          },
        ],
      });
    });

    const props = {
      accountIdentifier: mockHardwareWalletAccount.identifier,
    };

    afterAll(() => {
      vi.clearAllMocks();
    });

    it("should display principal", async () => {
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getPrincipal()).toBe(
        testHwPrincipalText
      );
    });

    it("should display hardware wallet buttons", async () => {
      const po = await renderWallet(props);
      expect(await po.getListNeuronsButtonPo().isPresent()).toBe(true);
      expect(await po.getShowHardwareWalletButtonPo().isPresent()).toBe(true);
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
