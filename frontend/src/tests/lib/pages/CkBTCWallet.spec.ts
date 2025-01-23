import * as ckbtcMinterApi from "$lib/api/ckbtc-minter.api";
import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import {
  CKTESTBTC_INDEX_CANISTER_ID,
  CKTESTBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { WALLET_TRANSACTIONS_RELOAD_DELAY } from "$lib/constants/wallet.constants";
import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
import * as services from "$lib/services/icrc-accounts.services";
import { ckbtcRetrieveBtcStatusesStore } from "$lib/stores/ckbtc-retrieve-btc-statuses.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import CkBTCAccountsTest from "$tests/lib/components/accounts/CkBTCAccountsTest.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockBTCAddressTestnet,
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
import type { RetrieveBtcStatusV2WithId } from "@dfinity/ckbtc";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

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

vi.mock("$lib/api/ckbtc-minter.api");
vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/icrc-index.api");

const blockedApiPaths = [
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
    vi.clearAllTimers();
    vi.useRealTimers();
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
    vi.mocked(ckbtcMinterApi.estimateFee).mockResolvedValue({
      minter_fee: 2000n,
      bitcoin_fee: 5000n,
    });
    vi.mocked(ckbtcMinterApi.retrieveBtcStatusV2ByAccount).mockResolvedValue(
      []
    );
  });

  describe("user not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
      page.mock({
        data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    it("should render universe name", async () => {
      const po = await renderWallet();
      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe("ckTESTBTC");
    });

    it("should not render a wallet address", async () => {
      const po = await renderWallet();
      expect(await po.getWalletPageHeaderPo().getHashPo().isPresent()).toBe(
        false
      );
    });

    it("should render balance placeholder", async () => {
      const po = await renderWallet();
      expect(await po.getWalletPageHeadingPo().hasBalancePlaceholder()).toBe(
        true
      );
    });

    it("should render 'Main' account name", async () => {
      const po = await renderWallet();
      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render sign in button", async () => {
      const po = await renderWallet();
      expect(await po.hasSignInButton()).toBe(true);
    });

    it("should render info card", async () => {
      const po = await renderWallet();
      const card = po.getCkBTCInfoCardPo();
      expect(await card.isPresent()).toBe(true);

      expect(await card.hasSkeletonText()).toBe(false);
      expect(await card.hasSpinner()).toBe(false);
      expect(await card.hasAddress()).toBe(false);
      expect(await card.hasQrCode()).toBe(false);

      expect(await card.hasQrCodePlaceholder()).toBe(true);
      expect(await card.hasSignInForAddressMessage()).toBe(true);
    });

    it("should render transactions placeholder", async () => {
      const po = await renderWallet();
      expect(await po.hasNoTransactions()).toBe(true);
    });

    it("should not render send/receive buttons", async () => {
      const po = await renderWallet();
      expect(
        await po.getCkBTCWalletFooterPo().getSendButtonPo().isPresent()
      ).toBe(false);
      expect(
        await po.getCkBTCWalletFooterPo().getReceiveButtonPo().isPresent()
      ).toBe(false);
    });
  });

  describe("accounts not loaded", () => {
    let resolveAccounts: (Account) => void;

    beforeEach(() => {
      page.mock({
        data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });

      vi.mocked(icrcLedgerApi.queryIcrcBalance).mockImplementation(() => {
        return new Promise<bigint>((resolve) => {
          resolveAccounts = resolve;
        });
      });
      vi.mocked(icrcLedgerApi.queryIcrcToken).mockResolvedValue(mockCkBTCToken);
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
      expect(icrcLedgerApi.queryIcrcBalance).toBeCalled();
      expect(icrcLedgerApi.queryIcrcToken).toBeCalled();
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
        ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID,
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
      vi.mocked(icrcLedgerApi.queryIcrcBalance).mockImplementation(() => {
        return Promise.resolve(
          afterTransfer
            ? expectedBalanceAfterTransfer
            : mockCkBTCMainAccount.balanceUlps
        );
      });
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

    describe("convert ckBTC to BTC with ICRC-2", () => {
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

    it("should load BTC retrieval statuses", async () => {
      const statusWithId: RetrieveBtcStatusV2WithId = {
        id: 123n,
        status: {
          Pending: null,
        },
      };
      vi.mocked(ckbtcMinterApi.retrieveBtcStatusV2ByAccount).mockResolvedValue([
        statusWithId,
      ]);
      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({});
      await renderWallet();
      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: [statusWithId],
      });
    });

    it("should reload BTC retrieval statuses after transfer", async () => {
      const statusWithId: RetrieveBtcStatusV2WithId = {
        id: 124n,
        status: {
          Pending: null,
        },
      };
      const { walletPo, sendModalPo } = await renderWalletAndModal();

      vi.mocked(ckbtcMinterApi.retrieveBtcStatusV2ByAccount).mockResolvedValue([
        statusWithId,
      ]);

      await runResolvedPromises();
      // Retrieval statuses are still empty.
      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: [],
      });

      // Make transfer
      await walletPo.getCkBTCWalletFooterPo().clickSendButton();
      await sendModalPo.transferToAddress({
        destinationAddress: "aaaaa-aa",
        amount: 10,
      });

      await runResolvedPromises();
      expect(get(ckbtcRetrieveBtcStatusesStore)).toEqual({
        [CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]: [statusWithId],
      });
    });

    it('should have canister links in "more" popup', async () => {
      const po = await renderWallet();
      const morePopoverPo = po.getWalletMorePopoverPo();

      await po.getMoreButton().click();
      await runResolvedPromises();

      expect(await morePopoverPo.isPresent()).toBe(true);
      expect(await morePopoverPo.getLinkToLedgerCanisterPo().getHref()).toBe(
        `https://dashboard.internetcomputer.org/canister/${CKTESTBTC_LEDGER_CANISTER_ID.toText()}`
      );
      expect(await morePopoverPo.getLinkToIndexCanisterPo().isPresent()).toBe(
        true
      );
      expect(await morePopoverPo.getLinkToIndexCanisterPo().getHref()).toBe(
        `https://dashboard.internetcomputer.org/canister/${CKTESTBTC_INDEX_CANISTER_ID.toText()}`
      );
    });
  });
});
