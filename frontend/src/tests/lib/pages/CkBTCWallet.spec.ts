import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKBTC_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/ckbtc.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
import * as services from "$lib/services/ckbtc-accounts.services";
import {
  ckBTCTransferTokens,
  syncCkBTCAccounts,
} from "$lib/services/ckbtc-accounts.services";
import * as transactionsServices from "$lib/services/ckbtc-transactions.services";
import { authStore } from "$lib/stores/auth.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import CkBTCAccountsTest from "$tests/lib/components/accounts/CkBTCAccountsTest.svelte";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import { mockUniversesTokens } from "$tests/mocks/tokens.mock";
import { CkBTCReceiveModalPo } from "$tests/page-objects/CkBTCReceiveModal.page-object";
import { CkBTCTransactionModalPo } from "$tests/page-objects/CkBTCTransactionModal.page-object";
import { CkBTCWalletPo } from "$tests/page-objects/CkBTCWallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import { mockBTCAddressTestnet } from "../../mocks/ckbtc-accounts.mock";

const expectedBalanceAfterTransfer = 11_111n;

vi.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    syncCkBTCAccounts: vi.fn().mockResolvedValue(undefined),
    loadCkBTCAccounts: vi.fn().mockResolvedValue(undefined),
    ckBTCTransferTokens: vi.fn().mockImplementation(async () => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [
            {
              ...mockCkBTCMainAccount,
              balanceE8s: expectedBalanceAfterTransfer,
            },
          ],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      return { blockIndex: 123n };
    }),
  };
});

vi.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadCkBTCAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/api/ckbtc-minter.api", () => {
  return {
    getBTCAddress: vi.fn().mockImplementation(() => mockBTCAddressTestnet),
  };
});

vi.mock("$lib/services/ckbtc-minter.services", async () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const actual = await vi.importActual<any>(
    "$lib/services/ckbtc-minter.services"
  );
  return {
    ...actual,
    updateBalance: vi.fn().mockResolvedValue([]),
    depositFee: vi.fn().mockResolvedValue(789n),
  };
});

vi.mock("$lib/services/ckbtc-info.services", () => {
  return {
    loadCkBTCInfo: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/worker-balances.services", () => ({
  initBalancesWorker: vi.fn(() =>
    Promise.resolve({
      startBalancesTimer: () => {
        // Do nothing
      },
      stopBalancesTimer: () => {
        // Do nothing
      },
    })
  ),
}));

vi.mock("$lib/services/worker-transactions.services", () => ({
  initTransactionsWorker: vi.fn(() =>
    Promise.resolve({
      startTransactionsTimer: () => {
        // Do nothing
      },
      stopTransactionsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("CkBTCWallet", () => {
  const props = {
    accountIdentifier: mockCkBTCMainAccount.identifier,
  };

  const modalProps = {
    ...props,
    testComponent: CkBTCWallet,
  };

  const renderWallet = async (): Promise<CkBTCWalletPo> => {
    const { container } = render(CkBTCWallet, props);
    await runResolvedPromises();
    return CkBTCWalletPo.under(new JestPageObjectElement(container));
  };

  const renderWalletAndModal = async (): Promise<{
    walletPo: CkBTCWalletPo;
    sendModalPo: CkBTCTransactionModalPo;
    receiveModalPo: CkBTCReceiveModalPo;
  }> => {
    const { container } = render(CkBTCAccountsTest, modalProps);
    await runResolvedPromises();
    return {
      walletPo: CkBTCWalletPo.under(new JestPageObjectElement(container)),
      sendModalPo: CkBTCTransactionModalPo.under(
        new JestPageObjectElement(container)
      ),
      receiveModalPo: CkBTCReceiveModalPo.under(
        new JestPageObjectElement(container)
      ),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe("accounts not loaded", () => {
    beforeEach(() => {
      icrcAccountsStore.reset();

      page.mock({
        data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    it("should render a spinner while loading", async () => {
      const po = await renderWallet();
      expect(await po.hasSpinner()).toBe(true);
    });

    it("should call to load ckBTC accounts", async () => {
      await renderWallet();

      await waitFor(() => expect(syncCkBTCAccounts).toBeCalled());
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date());

      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );

      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKTESTBTC_UNIVERSE_CANISTER_ID,
      });

      tokensStore.setTokens(mockUniversesTokens);

      page.mock({
        data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it("should render ckTESTBTC name", async () => {
      const po = await renderWallet();

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe("ckTESTBTC");
    });

    it("should hide spinner when selected account is loaded", async () => {
      const po = await renderWallet();

      expect(await po.hasSpinner()).toBe(false);
    });

    it("should render `Main` as subtitle", async () => {
      const po = await renderWallet();

      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render a balance with token", async () => {
      const po = await renderWallet();

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        "4'445'566.99 ckBTC"
      );
    });

    it("should open new transaction modal", async () => {
      const { walletPo, sendModalPo } = await renderWalletAndModal();

      expect(await sendModalPo.isPresent()).toBe(false);
      await walletPo.getCkBTCWalletFooterPo().clickSendButton();
      expect(await sendModalPo.isPresent()).toBe(true);
    });

    it("should update account after transfer tokens", async () => {
      const { walletPo, sendModalPo } = await renderWalletAndModal();

      // Check original sum
      expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
        "4'445'566.99 ckBTC"
      );

      // Make transfer
      await walletPo.getCkBTCWalletFooterPo().clickSendButton();
      await sendModalPo.transferToAddress({
        destinationAddress: "aaaaa-aa",
        amount: 10,
      });

      await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());

      // Account should have been updated and sum should be reflected
      expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
        "0.00011111 ckBTC"
      );
    });

    it("should reload transactions after transfer tokens", async () => {
      const { walletPo, sendModalPo } = await renderWalletAndModal();

      expect(transactionsServices.loadCkBTCAccountTransactions).toBeCalledTimes(
        0
      );

      // Check original sum
      expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
        "4'445'566.99 ckBTC"
      );

      // Make transfer
      await walletPo.getCkBTCWalletFooterPo().clickSendButton();
      await sendModalPo.transferToAddress({
        destinationAddress: "aaaaa-aa",
        amount: 10,
      });

      await waitFor(() => expect(ckBTCTransferTokens).toBeCalled());

      await advanceTime(CKBTC_TRANSACTIONS_RELOAD_DELAY + 1000);

      await waitFor(() =>
        expect(
          transactionsServices.loadCkBTCAccountTransactions
        ).toBeCalledTimes(1)
      );
    });

    it("should open receive modal", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      expect(await receiveModalPo.isPresent()).toBe(false);
      await walletPo.getCkBTCWalletFooterPo().clickReceiveButton();
      expect(await receiveModalPo.isPresent()).toBe(true);
    });

    it("should reload on close receive modal", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      expect(await receiveModalPo.isPresent()).toBe(false);
      await walletPo.getCkBTCWalletFooterPo().clickReceiveButton();
      expect(await receiveModalPo.isPresent()).toBe(true);

      await receiveModalPo.selectBitcoin();

      const spy = vi.spyOn(services, "loadCkBTCAccounts");

      await receiveModalPo.clickFinish();

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });
  });
});
