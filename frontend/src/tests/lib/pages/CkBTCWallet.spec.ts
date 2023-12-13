import * as ckbtcMinterApi from "$lib/api/ckbtc-minter.api";
import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as ckbtcLedgerApi from "$lib/api/wallet-ledger.api";
import {
  CKTESTBTC_MINTER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { WALLET_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/wallet.constants";
import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
import * as services from "$lib/services/wallet-accounts.services";
import { bitcoinAddressStore } from "$lib/stores/bitcoin.store";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import CkBTCAccountsTest from "$tests/lib/components/accounts/CkBTCAccountsTest.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockUniversesTokens } from "$tests/mocks/tokens.mock";
import { CkBTCReceiveModalPo } from "$tests/page-objects/CkBTCReceiveModal.page-object";
import { CkBTCTransactionModalPo } from "$tests/page-objects/CkBTCTransactionModal.page-object";
import { CkBTCWalletPo } from "$tests/page-objects/CkBTCWallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import { mockBTCAddressTestnet } from "../../mocks/ckbtc-accounts.mock";

const expectedBalanceAfterTransfer = 11_111n;
const testnetBtcAddress = "mziXLoUuJs427ATrgn5bMdxtUnXZMZCc3L";

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

vi.mock("$lib/api/wallet-ledger.api");
vi.mock("$lib/api/ckbtc-minter.api");
vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/icrc-index.api");

const blockedApiPaths = [
  "$lib/api/wallet-ledger.api",
  "$lib/api/ckbtc-minter.api",
  "$lib/api/icrc-ledger.api",
  "$lib/api/icrc-index.api",
];

describe("CkBTCWallet", () => {
  blockAllCallsTo(blockedApiPaths);

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
    tokensStore.reset();
    ckBTCInfoStore.reset();
    bitcoinAddressStore.reset();
    overrideFeatureFlagsStore.reset();
    resetIdentity();

    vi.mocked(icrcIndexApi.getTransactions).mockResolvedValue({
      transactions: [],
    });
    vi.mocked(ckbtcMinterApi.getBTCAddress).mockResolvedValue(
      mockBTCAddressTestnet
    );
    vi.mocked(ckbtcMinterApi.minterInfo).mockResolvedValue({
      retrieve_btc_min_amount: 80_000n,
      min_confirmations: 12,
      kyt_fee: 7_000n,
    });
    vi.mocked(ckbtcMinterApi.getWithdrawalAccount).mockResolvedValue({
      owner: CKTESTBTC_MINTER_CANISTER_ID,
      subaccount: [],
    });
    vi.mocked(ckbtcMinterApi.retrieveBtc).mockResolvedValue({
      block_index: 123n,
    });
    vi.mocked(ckbtcMinterApi.estimateFee).mockResolvedValue({
      minter_fee: 2000n,
      bitcoin_fee: 5000n,
    });
  });

  describe("accounts not loaded", () => {
    let resolveAccounts: (Account) => void;

    beforeEach(() => {
      icrcAccountsStore.reset();

      page.mock({
        data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });

      vi.mocked(ckbtcLedgerApi.getAccount).mockImplementation(() => {
        return new Promise<Account>((resolve) => {
          resolveAccounts = resolve;
        });
      });
      vi.mocked(ckbtcLedgerApi.getToken).mockResolvedValue(mockCkBTCToken);
    });

    it("should render a spinner while loading", async () => {
      const po = await renderWallet();
      expect(await po.hasSpinner()).toBe(true);
      resolveAccounts(mockCkBTCMainAccount);
      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(false);
    });

    it("should call to load ckBTC accounts", async () => {
      await renderWallet();
      expect(ckbtcLedgerApi.getAccount).toBeCalled();
      expect(ckbtcLedgerApi.getToken).toBeCalled();
    });
  });

  describe("accounts loaded", () => {
    let afterTransfer = false;

    beforeEach(() => {
      afterTransfer = false;
      vi.useFakeTimers().setSystemTime(new Date());

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

      vi.mocked(icrcLedgerApi.icrcTransfer).mockImplementation(() => {
        afterTransfer = true;
        return Promise.resolve(1n);
      });
      vi.mocked(icrcLedgerApi.approveTransfer).mockImplementation(() => {
        return Promise.resolve(2n);
      });
      vi.mocked(ckbtcMinterApi.retrieveBtcWithApproval).mockImplementation(
        () => {
          afterTransfer = true;
          return Promise.resolve({ block_index: 3n });
        }
      );
      vi.mocked(ckbtcLedgerApi.getAccount).mockImplementation(() => {
        return Promise.resolve({
          ...mockCkBTCMainAccount,
          ...(afterTransfer
            ? { balanceUlps: expectedBalanceAfterTransfer }
            : {}),
        });
      });
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it("should render ckTESTBTC name", async () => {
      const po = await renderWallet();

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe("ckTESTBTC");
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

      await runResolvedPromises();
      expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);

      // Account should have been updated and sum should be reflected
      expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
        "0.00011111 ckBTC"
      );
    });

    it("should reload transactions after transfer tokens", async () => {
      const { walletPo, sendModalPo } = await renderWalletAndModal();

      expect(icrcIndexApi.getTransactions).toBeCalledTimes(1);

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

      await runResolvedPromises();
      expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);

      await advanceTime(WALLET_TRANSACTIONS_RELOAD_DELAY + 1000);

      expect(icrcIndexApi.getTransactions).toBeCalledTimes(2);
    });

    describe("without ICRC-2", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC_ICRC2", false);
      });

      it("should update account after withdrawing BTC", async () => {
        const { walletPo, sendModalPo } = await renderWalletAndModal();

        // Check original sum
        expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
          "4'445'566.99 ckBTC"
        );

        // Make transfer
        await walletPo.getCkBTCWalletFooterPo().clickSendButton();
        await sendModalPo.transferToAddress({
          destinationAddress: testnetBtcAddress,
          amount: 10,
        });

        await runResolvedPromises();
        expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);
        expect(icrcLedgerApi.approveTransfer).toBeCalledTimes(0);
        expect(ckbtcMinterApi.retrieveBtcWithApproval).toBeCalledTimes(0);

        // Account should have been updated and sum should be reflected
        expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
          "0.00011111 ckBTC"
        );
      });

      it("should reload transactions after withdrawing BTC", async () => {
        const { walletPo, sendModalPo } = await renderWalletAndModal();

        expect(icrcIndexApi.getTransactions).toBeCalledTimes(1);

        // Check original sum
        expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
          "4'445'566.99 ckBTC"
        );

        // Make transfer
        await walletPo.getCkBTCWalletFooterPo().clickSendButton();
        await sendModalPo.transferToAddress({
          destinationAddress: testnetBtcAddress,
          amount: 10,
        });

        await runResolvedPromises();
        expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(1);
        expect(icrcLedgerApi.approveTransfer).toBeCalledTimes(0);
        expect(ckbtcMinterApi.retrieveBtcWithApproval).toBeCalledTimes(0);

        expect(icrcIndexApi.getTransactions).toBeCalledTimes(2);

        await advanceTime(WALLET_TRANSACTIONS_RELOAD_DELAY + 1000);

        // This additional loading of transactions is not necessary.
        // TODO: Remove the double reloading and change the expected number of
        // calls from 2 to 3.
        expect(icrcIndexApi.getTransactions).toBeCalledTimes(3);
      });
    });

    describe("with ICRC-2", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC_ICRC2", true);
      });

      it("should update account after withdrawing BTC", async () => {
        const { walletPo, sendModalPo } = await renderWalletAndModal();

        // Check original sum
        expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
          "4'445'566.99 ckBTC"
        );

        // Make transfer
        await walletPo.getCkBTCWalletFooterPo().clickSendButton();
        await sendModalPo.transferToAddress({
          destinationAddress: testnetBtcAddress,
          amount: 10,
        });

        await runResolvedPromises();
        expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(0);
        expect(icrcLedgerApi.approveTransfer).toBeCalledTimes(1);
        expect(ckbtcMinterApi.retrieveBtcWithApproval).toBeCalledTimes(1);

        // Account should have been updated and sum should be reflected
        expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
          "0.00011111 ckBTC"
        );
      });

      it("should reload transactions after withdrawing BTC", async () => {
        const { walletPo, sendModalPo } = await renderWalletAndModal();

        expect(icrcIndexApi.getTransactions).toBeCalledTimes(1);

        // Check original sum
        expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
          "4'445'566.99 ckBTC"
        );

        // Make transfer
        await walletPo.getCkBTCWalletFooterPo().clickSendButton();
        await sendModalPo.transferToAddress({
          destinationAddress: testnetBtcAddress,
          amount: 10,
        });

        await runResolvedPromises();
        expect(icrcLedgerApi.icrcTransfer).toBeCalledTimes(0);
        expect(icrcLedgerApi.approveTransfer).toBeCalledTimes(1);
        expect(ckbtcMinterApi.retrieveBtcWithApproval).toBeCalledTimes(1);

        expect(icrcIndexApi.getTransactions).toBeCalledTimes(2);

        await advanceTime(WALLET_TRANSACTIONS_RELOAD_DELAY + 1000);

        // This additional loading of transactions is not necessary.
        // TODO: Remove the double reloading and change the expected number of
        // calls from 2 to 3.
        expect(icrcIndexApi.getTransactions).toBeCalledTimes(3);
      });
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

      const spy = vi.spyOn(services, "loadAccounts");

      await receiveModalPo.clickFinish();

      await waitFor(() => expect(spy).toHaveBeenCalled());
    });

    it("should display the bitcoin address", async () => {
      const { walletPo } = await renderWalletAndModal();
      expect(await walletPo.getCkBTCInfoCardPo().getAddress()).toBe(
        mockBTCAddressTestnet
      );
    });
  });
});
