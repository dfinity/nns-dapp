import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import NnsWallet from "$lib/pages/NnsWallet.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import { authStore } from "$lib/stores/auth.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
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
import { Principal } from "@dfinity/principal";
import { render } from "@testing-library/svelte";
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
  const mainBalanceE8s = BigInt(10_000_000);

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

  const renderWallet = (props) => {
    const { container } = render(NnsWallet, props);
    const po = NnsWalletPo.under(new JestPageObjectElement(container));
    return po;
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

    it("should render a spinner while loading", async () => {
      const po = renderWallet({});

      expect(await po.hasSpinner()).toBe(true);
    });

    it("new transaction action should be disabled while loading", async () => {
      const po = renderWallet({});

      expect(await po.getSendButtonPo().isDisabled()).toBe(true);
    });

    it("new transaction should remain disabled if route is valid but store is not loaded", async () => {
      const po = renderWallet(props);

      // init
      expect(await po.getSendButtonPo().isDisabled()).toBe(true);

      await tick();

      // route set triggers get account
      expect(await po.getSendButtonPo().isDisabled()).toBe(true);
    });

    it("should show new accounts after being loaded", async () => {
      let resolveQueryBalance;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockImplementation(
        () =>
          new Promise<bigint>((resolve) => {
            resolveQueryBalance = () => resolve(mainBalanceE8s);
          })
      );

      const po = renderWallet(props);

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
      const po = renderWallet(props);

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
      const po = renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("4.32 ICP");
    });

    it("should enable new transaction action for route and store", async () => {
      const po = renderWallet(props);

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
      const po = renderWallet(props);

      expect(
        await po.getTransactionListPo().getSkeletonCardPo().isPresent()
      ).toBe(true);
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
      const po = renderWallet(props);

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
      const po = renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getPrincipal()).toBe(
        testHwPrincipalText
      );
    });

    it("should display hardware wallet buttons", async () => {
      const po = renderWallet(props);
      expect(await po.getListNeuronsButtonPo().isPresent()).toBe(true);
      expect(await po.getShowHardwareWalletButtonPo().isPresent()).toBe(true);
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: SpyInstance;
    beforeEach(() => {
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
