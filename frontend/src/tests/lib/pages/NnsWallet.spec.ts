import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as governanceApi from "$lib/api/governance.api";
import * as indexApi from "$lib/api/icp-index.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import {
  INDEX_CANISTER_ID,
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import NnsWallet from "$lib/pages/NnsWallet.svelte";
import { cancelPollAccounts } from "$lib/services/icp-accounts.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpTransactionsStore } from "$lib/stores/icp-transactions.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { page } from "$mocks/$app/stores";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockAccountDetails,
  mockAccountsStoreData,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { IntersectionObserverActive } from "$tests/mocks/infinitescroll.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  createMockSendTransactionWithId,
  mockEmptyGetTransactionsResponse,
  mockTransactionWithId,
} from "$tests/mocks/transaction.mock";
import { IcpTransactionModalPo } from "$tests/page-objects/IcpTransactionModal.page-object";
import { NnsWalletPo } from "$tests/page-objects/NnsWallet.page-object";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";
import AccountsTest from "./AccountsTest.svelte";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/accounts.api");
vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/icp-index.api");
vi.mock("$lib/api/governance.api");

describe("NnsWallet", () => {
  const accountIdentifier = mockMainAccount.identifier;
  const props = {
    accountIdentifier,
  };
  const mainBalanceE8s = 10_000_000n;
  const firstPageTransactions = [
    { id: 1000n, transaction: mockTransactionWithId.transaction },
  ];
  const oldestTxId = 10n;
  const lastPageTransactions = [
    { id: oldestTxId, transaction: mockTransactionWithId.transaction },
  ];
  const accountTransactions = [mockTransactionWithId];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    cancelPollAccounts();
    resetAccountsForTesting();
    neuronsStore.reset();
    resetNeuronsApiService();
    icpTransactionsStore.reset();
    toastsStore.reset();
    resetIdentity();

    vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
      mainBalanceE8s
    );
    vi.spyOn(indexApi, "getTransactions").mockResolvedValue({
      transactions: firstPageTransactions,
      oldestTxId,
      balance: mainBalanceE8s,
    });

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Wallet,
    });
    overrideFeatureFlagsStore.reset();
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
          resolveQueryBalance = (balance?: bigint) =>
            resolve(balance ?? mainBalanceE8s);
        })
    );
    return (balance?: bigint) => resolveQueryBalance(balance);
  };

  const pauseGetTransactions = () => {
    let resolveGetTransactions;
    vi.spyOn(indexApi, "getTransactions").mockImplementation(
      () =>
        new Promise<indexApi.GetTransactionsResponse>((resolve) => {
          resolveGetTransactions = (
            response?: indexApi.GetTransactionsResponse
          ) => resolve(response ?? mockEmptyGetTransactionsResponse);
        })
    );
    return (response?: indexApi.GetTransactionsResponse) =>
      resolveGetTransactions(response);
  };

  describe("user not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should not poll accounts", async () => {
      const spyQueryAccount = vi
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));

      await renderWallet({});
      expect(spyQueryAccount).not.toBeCalled();
    });

    it("should render universe name", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe(
        "Internet Computer"
      );
    });

    it("should not render a wallet address", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeaderPo().getHashPo().isPresent()).toBe(
        false
      );
    });

    it("should render balance placeholder", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeadingPo().hasBalancePlaceholder()).toBe(
        true
      );
    });

    it("should render 'Main' account name", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("");
    });

    it("should render sign in button", async () => {
      const po = await renderWallet({});
      expect(await po.hasSignInButton()).toBe(true);
    });

    it("should render transactions placeholder", async () => {
      const po = await renderWallet({});
      expect(await po.hasNoTransactions()).toBe(true);
    });

    it("should not render send/receive buttons", async () => {
      const po = await renderWallet({});
      expect(await po.getSendButtonPo().isPresent()).toBe(false);
      expect(await po.getReceiveButtonPo().isPresent()).toBe(false);
    });

    it("should navigate to accounts when account identifier is invalid after signing in", async () => {
      await renderWallet({
        accountIdentifier: "invalid-account-identifier",
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: OWN_CANISTER_ID_TEXT,
      });
      expect(get(toastsStore)).toEqual([]);

      // When signing in, the component will load accounts. Mock the result.
      vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
      // Sign in.
      resetIdentity();
      await runResolvedPromises();

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

    it('should render "more" button', async () => {
      const po = await renderWallet({});
      expect(await po.getMoreButton().isPresent()).toBe(true);
    });

    it("should not display more button when ENABLE_IMPORT_TOKEN disabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_IMPORT_TOKEN", false);

      const po = await renderWallet({});
      expect(await po.hasMoreButton()).toBe(false);
    });

    it('should have canister links in "more" popup', async () => {
      const po = await renderWallet({});
      const morePopoverPo = po.getWalletMorePopoverPo();

      // The popover should not be visible initially.
      expect(await morePopoverPo.getLinkToLedgerCanisterPo().isPresent()).toBe(
        false
      );

      await po.clickMore();

      await runResolvedPromises();

      expect(await morePopoverPo.getLinkToLedgerCanisterPo().isPresent()).toBe(
        true
      );
      expect(await morePopoverPo.getLinkToLedgerCanisterPo().getHref()).toBe(
        `https://dashboard.internetcomputer.org/canister/${LEDGER_CANISTER_ID.toText()}`
      );
      expect(await morePopoverPo.getLinkToIndexCanisterPo().isPresent()).toBe(
        true
      );
      expect(await morePopoverPo.getLinkToIndexCanisterPo().getHref()).toBe(
        `https://dashboard.internetcomputer.org/canister/${INDEX_CANISTER_ID.toText()}`
      );
    });
  });

  describe("no accounts", () => {
    beforeEach(() => {
      vi.spyOn(nnsDappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
    });

    it("should load balance and transactions", async () => {
      const balanceE8s = 30_000_000n;
      const balanceFormatted = "0.30 ICP";
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(balanceE8s);
      vi.spyOn(indexApi, "getTransactions").mockResolvedValue({
        transactions: [
          createMockSendTransactionWithId({
            amount: 100_000_000n,
            to: accountIdentifier,
          }),
        ],
        oldestTxId: 0n,
        balance: balanceE8s,
      });

      expect(indexApi.getTransactions).not.toBeCalled();
      expect(ledgerApi.queryAccountBalance).not.toBeCalled();

      const po = await renderWallet(props);

      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(1);
      expect(ledgerApi.queryAccountBalance).toBeCalledWith({
        certified: true,
        icpAccountIdentifier: accountIdentifier,
        identity: mockIdentity,
      });

      expect(indexApi.getTransactions).toBeCalledTimes(1);
      expect(indexApi.getTransactions).toBeCalledWith({
        accountIdentifier: accountIdentifier,
        identity: mockIdentity,
        start: undefined,
        maxResults: 20n,
      });

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        balanceFormatted
      );
      expect(
        await po.getUiTransactionsListPo().getTransactionCardPos()
      ).toHaveLength(1);
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
      expect(await po.getSendButtonPo().isPresent()).toBe(false);

      resolveQueryBalance();

      await runResolvedPromises();
      expect(await po.getSendButtonPo().isPresent()).toBe(true);
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

    it("should not load balance twice while accounts are loaded", async () => {
      expect(ledgerApi.queryAccountBalance).not.toBeCalled();

      await renderWallet(props);

      // Balance should be loaded, but not more than necessary.
      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(1);
      expect(ledgerApi.queryAccountBalance).toBeCalledWith({
        certified: true,
        icpAccountIdentifier: accountIdentifier,
        identity: mockIdentity,
      });
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      setAccountsForTesting({
        ...mockAccountsStoreData,
        main: {
          ...mockAccountsStoreData.main,
          balanceUlps: mainBalanceE8s,
        },
      });
    });

    it("should render nns project name", async () => {
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe(
        "Internet Computer"
      );
    });

    it("should render a balance with token in summary", async () => {
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        432_100_000n
      );
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("4.32 ICP");
    });

    it("should reload balance on open", async () => {
      const oldBalance = 135_000_000n;
      const oldBalanceFormatted = "1.35 ICP";
      const newBalance = 235_000_000n;
      const newBalanceFormatted = "2.35 ICP";

      setAccountsForTesting({
        ...mockAccountsStoreData,
        main: {
          ...mockMainAccount,
          balanceUlps: oldBalance,
        },
      });

      const resolveQueryBalance = pauseQueryAccountBalance();

      expect(indexApi.getTransactions).not.toBeCalled();
      expect(ledgerApi.queryAccountBalance).not.toBeCalled();

      const po = await renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        oldBalanceFormatted
      );

      // Balance should be reloaded.
      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(2);
      const expectedQueryBalanceParams = {
        icpAccountIdentifier: mockAccountsStoreData.main.identifier,
        identity: mockIdentity,
      };
      expect(ledgerApi.queryAccountBalance).toBeCalledWith({
        certified: false,
        ...expectedQueryBalanceParams,
      });
      expect(ledgerApi.queryAccountBalance).toBeCalledWith({
        certified: true,
        ...expectedQueryBalanceParams,
      });

      // New balance should be displayed.
      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        oldBalanceFormatted
      );
      resolveQueryBalance(newBalance);
      await runResolvedPromises();
      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        newBalanceFormatted
      );
    });

    it("should render transactions from ICP Index canister", async () => {
      const po = await renderWallet(props);

      expect(
        await po.getUiTransactionsListPo().getTransactionCardPos()
      ).toHaveLength(accountTransactions.length);
    });

    it("should render second page of transactions from ICP Index canister", async () => {
      vi.stubGlobal("IntersectionObserver", IntersectionObserverActive);
      const resolveFunctions = [];
      vi.spyOn(indexApi, "getTransactions").mockImplementation(
        () =>
          new Promise<indexApi.GetTransactionsResponse>((resolve) => {
            resolveFunctions.push(resolve);
          })
      );

      const { container } = render(NnsWallet, props);
      const po = NnsWalletPo.under(new JestPageObjectElement(container));

      await runResolvedPromises();
      expect(resolveFunctions).toHaveLength(1);
      resolveFunctions[0]({
        transactions: firstPageTransactions,
        oldestTxId,
        balance: mainBalanceE8s,
      });
      await runResolvedPromises();

      expect(
        await po.getUiTransactionsListPo().getTransactionCardPos()
      ).toHaveLength(firstPageTransactions.length);

      expect(resolveFunctions).toHaveLength(2);
      resolveFunctions[1]({
        transactions: lastPageTransactions,
        oldestTxId,
        balance: mainBalanceE8s,
      });
      await runResolvedPromises();

      expect(
        await po.getUiTransactionsListPo().getTransactionCardPos()
      ).toHaveLength(
        firstPageTransactions.length + lastPageTransactions.length
      );

      await runResolvedPromises();
      // Third page should not be requested.
      expect(resolveFunctions).toHaveLength(2);
    });

    it("should render 'Staked' transaction from ICP Index canister", async () => {
      const stakeNeuronTransaction: TransactionWithId = {
        id: 1234n,
        transaction: {
          memo: 123456n,
          icrc1_memo: [],
          created_at_time: [{ timestamp_nanos: 1234n }],
          timestamp: [{ timestamp_nanos: 1235n }],
          operation: {
            Transfer: {
              from: mockMainAccount.identifier,
              to: mockNeuron.fullNeuron.accountIdentifier,
              amount: { e8s: 200_000_000n },
              fee: { e8s: 10_000n },
              spender: [],
            },
          },
        },
      };
      vi.spyOn(indexApi, "getTransactions").mockResolvedValue({
        transactions: [stakeNeuronTransaction],
        oldestTxId: 1234n,
        balance: mainBalanceE8s,
      });
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([mockNeuron]);

      const po = await renderWallet(props);

      const transactionCardsPos = await po
        .getUiTransactionsListPo()
        .getTransactionCardPos();
      expect(await transactionCardsPos[0].getHeadline()).toBe("Staked");
    });

    it("should render 'Decentralization Swap' transaction from ICP Index canister", async () => {
      const rootCanisterId = principal(0);
      const swapCanisterId = principal(1);
      setSnsProjects([
        {
          rootCanisterId,
          swapCanisterId,
        },
      ]);
      const swapCanisterAccount = getSwapCanisterAccount({
        controller: mockMainAccount.principal,
        swapCanisterId,
      });
      const swapTransaction: TransactionWithId = {
        id: 1234n,
        transaction: {
          memo: 123456n,
          icrc1_memo: [],
          created_at_time: [{ timestamp_nanos: 1234n }],
          timestamp: [{ timestamp_nanos: 1235n }],
          operation: {
            Transfer: {
              from: mockMainAccount.identifier,
              to: swapCanisterAccount.toHex(),
              amount: { e8s: 200_000_000n },
              fee: { e8s: 10_000n },
              spender: [],
            },
          },
        },
      };
      vi.spyOn(indexApi, "getTransactions").mockResolvedValue({
        transactions: [swapTransaction],
        oldestTxId: 1234n,
        balance: mainBalanceE8s,
      });

      const po = await renderWallet(props);

      const transactionCardsPos = await po
        .getUiTransactionsListPo()
        .getTransactionCardPos();
      expect(await transactionCardsPos[0].getHeadline()).toBe(
        "Decentralization Swap"
      );
    });

    it("should display SkeletonCard while loading transactions from ICP Index canister", async () => {
      let resolveGetTransactions;
      vi.spyOn(indexApi, "getTransactions").mockImplementation(
        () =>
          new Promise<indexApi.GetTransactionsResponse>((resolve) => {
            resolveGetTransactions = resolve;
          })
      );
      const po = await renderWallet(props);

      await runResolvedPromises();
      expect(
        await po.getUiTransactionsListPo().getSkeletonCardPo().isPresent()
      ).toBe(true);

      resolveGetTransactions({
        transactions: accountTransactions,
        oldestTxId: mockTransactionWithId.id,
        balance: mainBalanceE8s,
      });

      await runResolvedPromises();
      expect(
        await po.getUiTransactionsListPo().getSkeletonCardPo().isPresent()
      ).toBe(false);
    });

    it("should not display SkeletonCard while loading transactions if there are transactions present in the store from ICP Index canister", async () => {
      let resolveGetTransactions;
      vi.spyOn(indexApi, "getTransactions").mockImplementation(
        () =>
          new Promise<indexApi.GetTransactionsResponse>((resolve) => {
            resolveGetTransactions = resolve;
          })
      );
      icpTransactionsStore.addTransactions({
        accountIdentifier: mockMainAccount.identifier,
        transactions: accountTransactions,
        oldestTxId: mockTransactionWithId.id,
        completed: false,
      });
      const po = await renderWallet(props);

      await runResolvedPromises();
      expect(
        await po.getUiTransactionsListPo().getSkeletonCardPo().isPresent()
      ).toBe(false);
      expect(
        await po.getUiTransactionsListPo().getTransactionCardPos()
      ).toHaveLength(accountTransactions.length);

      resolveGetTransactions({
        transactions: accountTransactions,
        oldestTxId: mockTransactionWithId.id,
        balance: mainBalanceE8s,
      });

      await runResolvedPromises();
      expect(
        await po.getUiTransactionsListPo().getSkeletonCardPo().isPresent()
      ).toBe(false);
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
      const oldBalance = 105_000_000n;
      const oldBalanceFormatted = "1.05 ICP";
      const newBalance = 205_000_000n;
      const newBalanceFormatted = "2.05 ICP";

      setAccountsForTesting({
        ...mockAccountsStoreData,
        main: {
          ...mockMainAccount,
          balanceUlps: oldBalance,
        },
      });

      const resolveQueryBalance = pauseQueryAccountBalance();
      const resolveGetTransactions = pauseGetTransactions();

      const { walletPo, receiveModalPo } =
        await renderWalletAndModals(modalProps);

      await walletPo.clickReceive();

      expect(indexApi.getTransactions).toBeCalledTimes(1);
      vi.mocked(indexApi.getTransactions).mockClear();

      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(2);
      vi.mocked(ledgerApi.queryAccountBalance).mockClear();

      expect(indexApi.getTransactions).not.toBeCalled();
      expect(ledgerApi.queryAccountBalance).not.toBeCalled();

      await receiveModalPo.clickFinish();

      // Balance should be reloaded.
      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(2);
      const expectedQueryBalanceParams = {
        icpAccountIdentifier: mockAccountsStoreData.main.identifier,
        identity: mockIdentity,
      };
      expect(ledgerApi.queryAccountBalance).toBeCalledWith({
        certified: false,
        ...expectedQueryBalanceParams,
      });
      expect(ledgerApi.queryAccountBalance).toBeCalledWith({
        certified: true,
        ...expectedQueryBalanceParams,
      });

      // New balance should be displayed.
      expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
        oldBalanceFormatted
      );
      resolveQueryBalance(newBalance);
      await runResolvedPromises();
      expect(await walletPo.getWalletPageHeadingPo().getTitle()).toBe(
        newBalanceFormatted
      );

      // Transactions should be reloaded.
      expect(indexApi.getTransactions).toBeCalledTimes(1);
      const expectedGetTransactionParams = {
        accountIdentifier: mockAccountsStoreData.main.identifier,
        identity: mockIdentity,
        start: undefined,
        maxResults: 20n,
      };
      expect(indexApi.getTransactions).toBeCalledWith({
        ...expectedGetTransactionParams,
      });

      // New transactions should be displayed.
      expect(
        await walletPo.getUiTransactionsListPo().getTransactionCardPos()
      ).toHaveLength(0);
      resolveGetTransactions({
        transactions: [
          createMockSendTransactionWithId({
            amount: newBalance - oldBalance,
            to: accountIdentifier,
          }),
        ],
        oldestTxId: 0n,
        balance: newBalance,
      });
      await runResolvedPromises();
      expect(
        await walletPo.getUiTransactionsListPo().getTransactionCardPos()
      ).toHaveLength(1);

      // Reloading the balance should not have resulted in additional calls to
      // getTransactions.
      expect(indexApi.getTransactions).toBeCalledTimes(1);
      expect(ledgerApi.queryAccountBalance).toBeCalledTimes(2);
    });

    it("should default to main account when account identifier is missing", async () => {
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
      setAccountsForTesting({
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
      setAccountsForTesting({
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
    let spyQueryAccount: MockInstance;
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
