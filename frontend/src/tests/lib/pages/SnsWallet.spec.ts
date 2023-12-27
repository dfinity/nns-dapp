import * as snsIndexApi from "$lib/api/sns-index.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import SnsWallet from "$lib/pages/SnsWallet.svelte";
import * as workerBalances from "$lib/services/worker-balances.services";
import * as workerTransactions from "$lib/services/worker-transactions.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { SnsWalletPo } from "$tests/page-objects/SnsWallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/sns-ledger.api");
vi.mock("$lib/api/sns-index.api");

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

describe("SnsWallet", () => {
  const testTokenSymbol = "OOO";
  const testTokenName = "Out of office";

  const testToken = {
    ...mockSnsToken,
    name: testTokenName,
    symbol: testTokenSymbol,
  };

  const props = {
    accountIdentifier: mockSnsMainAccount.identifier,
  };

  const rootCanisterId = rootCanisterIdMock;
  const rootCanisterIdText = rootCanisterId.toText();
  const fee = 10_000n;
  const projectName = "Tetris";

  const renderComponent = async (props: { accountIdentifier: string }) => {
    const { container } = render(SnsWallet, props);
    await runResolvedPromises();
    return SnsWalletPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
    vi.clearAllMocks();
    snsAccountsStore.reset();
    transactionsFeesStore.reset();
    toastsStore.reset();
    vi.spyOn(snsIndexApi, "getSnsTransactions").mockResolvedValue({
      oldestTxId: BigInt(1234),
      transactions: [mockIcrcTransactionWithId],
    });
    vi.spyOn(snsLedgerApi, "transactionFee").mockResolvedValue(fee);
    vi.spyOn(snsLedgerApi, "getSnsToken").mockResolvedValue(testToken);
    vi.spyOn(snsLedgerApi, "snsTransfer").mockResolvedValue(10n);

    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
        tokenMetadata: testToken,
      },
    ]);
    page.mock({
      data: { universe: rootCanisterIdText },
      routeId: AppPath.Wallet,
    });
  });

  describe("loading accounts", () => {
    let resolve;

    beforeEach(() => {
      resolve = undefined;
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockImplementation(() => {
        return new Promise<Account[]>((r) => {
          resolve = r;
        });
      });
    });

    it("should hide spinner when account is loaded", async () => {
      const po = await renderComponent(props);

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(true);

      expect(resolve).toBeDefined();
      resolve([mockSnsMainAccount]);

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(false);
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockResolvedValue([
        mockSnsMainAccount,
      ]);
    });

    it("should render sns project name", async () => {
      const po = await renderComponent(props);

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe(projectName);
    });

    it("should render transactions", async () => {
      const po = await renderComponent(props);

      expect(await po.getIcrcTransactionsListPo().isPresent()).toBe(true);
    });

    it("should render 'Main' as subtitle", async () => {
      const po = await renderComponent(props);

      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render a balance with token", async () => {
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockResolvedValue([
        {
          ...mockSnsMainAccount,
          balanceUlps: 2_233_000_000n,
        },
      ]);

      const po = await renderComponent(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("22.33 OOO");
    });

    it("should open new transaction modal", async () => {
      const po = await renderComponent(props);

      await runResolvedPromises();
      expect(await po.getSnsTransactionModalPo().isPresent()).toBe(false);

      await po.clickSendButton();

      await runResolvedPromises();
      expect(await po.getSnsTransactionModalPo().isPresent()).toBe(true);
    });

    it("should make a new transaction", async () => {
      const po = await renderComponent(props);

      await po.clickSendButton();

      const destinationAccount = {
        owner: principal(1),
      };

      expect(snsLedgerApi.snsTransfer).toHaveBeenCalledTimes(0);

      await po.getSnsTransactionModalPo().transferToAddress({
        destinationAddress: encodeIcrcAccount(destinationAccount),
        amount: 2,
      });

      expect(snsLedgerApi.snsTransfer).toHaveBeenCalledTimes(1);
      expect(snsLedgerApi.snsTransfer).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId,
        amount: 200000000n,
        fromSubaccount: undefined,
        fee,
        to: destinationAccount,
      });
    });

    const modalProps = {
      ...props,
      testComponent: SnsWallet,
    };

    const renderWalletAndModal = async (): Promise<{
      walletPo: SnsWalletPo;
      receiveModalPo: ReceiveModalPo;
    }> => {
      const { container } = render(AccountsTest, modalProps);
      await runResolvedPromises();
      return {
        walletPo: SnsWalletPo.under(new JestPageObjectElement(container)),
        receiveModalPo: ReceiveModalPo.under(
          new JestPageObjectElement(container)
        ),
      };
    };

    it("should open receive modal with sns logo", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      runResolvedPromises();
      expect(await receiveModalPo.isPresent()).toBe(false);

      await walletPo.clickReceiveButton();

      runResolvedPromises();
      expect(await receiveModalPo.isPresent()).toBe(true);
      await receiveModalPo.waitForQrCode();
      expect(await receiveModalPo.getLogoAltText()).toBe(testTokenSymbol);
    });

    it("should reload account after finish receiving tokens", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      await walletPo.clickReceiveButton();

      // Query + update
      expect(snsLedgerApi.getSnsAccounts).toHaveBeenCalledTimes(2);
      // Transactions can only be fetched from the Index canister with `updated` calls for now.
      expect(snsIndexApi.getSnsTransactions).toHaveBeenCalledTimes(1);

      await receiveModalPo.clickFinish();

      await runResolvedPromises();
      expect(snsLedgerApi.getSnsAccounts).toHaveBeenCalledTimes(4);
      expect(snsIndexApi.getSnsTransactions).toHaveBeenCalledTimes(2);
    });

    it("should display receive modal information", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      await walletPo.clickReceiveButton();

      await receiveModalPo.waitForQrCode();

      expect(await receiveModalPo.getTokenAddressLabel()).toBe("OOO Address");
    });

    it("should init worker that sync the balance", async () => {
      const spy = vi.spyOn(workerBalances, "initBalancesWorker");

      await renderComponent(props);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should init worker that sync the transactions", async () => {
      const spy = vi.spyOn(workerTransactions, "initTransactionsWorker");

      const po = await renderComponent(props);

      expect(await po.getIcrcTransactionsListPo().isPresent()).toBe(true);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should nagigate to accounts when account identifier is missing", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      await renderComponent({
        accountIdentifier: undefined,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: rootCanisterIdText,
      });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: 'Sorry, the account "" was not found',
        },
      ]);
    });

    it("should nagigate to accounts when account identifier is invalid", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      await renderComponent({
        accountIdentifier: "invalid-account-identifier",
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: rootCanisterIdText,
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
        universe: rootCanisterIdText,
      });
      await renderComponent({
        accountIdentifier: mockSnsMainAccount.identifier,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      expect(get(toastsStore)).toEqual([]);
    });
  });
});
