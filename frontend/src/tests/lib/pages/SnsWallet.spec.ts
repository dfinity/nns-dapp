import * as snsIndexApi from "$lib/api/sns-index.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
import SnsWallet from "$lib/pages/SnsWallet.svelte";
import * as workerBalances from "$lib/services/worker-balances.services";
import * as workerTransactions from "$lib/services/worker-transactions.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Account } from "$lib/types/account";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { waitModalIntroEnd } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { testTransferTokens } from "$tests/utils/transaction-modal.test-utils";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
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
  const props = {
    accountIdentifier: mockSnsMainAccount.identifier,
  };

  const rootCanisterId = rootCanisterIdMock;
  const rootCanisterIdText = rootCanisterId.toText();
  const fee = 10_000n;
  const projectName = "Tetris";

  beforeEach(() => {
    resetIdentity();
    vi.clearAllMocks();
    snsAccountsStore.reset();
    transactionsFeesStore.reset();
    vi.spyOn(snsIndexApi, "getSnsTransactions").mockResolvedValue({
      oldestTxId: BigInt(1234),
      transactions: [mockIcrcTransactionWithId],
    });
    vi.spyOn(snsLedgerApi, "transactionFee").mockResolvedValue(fee);
    vi.spyOn(snsLedgerApi, "getSnsToken").mockResolvedValue(mockSnsToken);
    vi.spyOn(snsLedgerApi, "snsTransfer").mockResolvedValue(10n);

    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
      },
    ]);
    page.mock({ data: { universe: rootCanisterIdText } });
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
      const { queryByTestId } = render(SnsWallet, props);

      expect(queryByTestId("spinner")).toBeInTheDocument();

      await waitFor(() => expect(resolve).toBeDefined());

      resolve([mockSnsMainAccount]);
      await runResolvedPromises();

      expect(queryByTestId("spinner")).toBeNull();
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockResolvedValue([
        mockSnsMainAccount,
      ]);
    });

    it("should render sns project name", async () => {
      const { getByTestId } = render(SnsWallet, props);

      await runResolvedPromises();

      const titleRow = getByTestId("universe-page-summary-component");

      expect(titleRow.textContent.trim()).toBe(projectName);
    });

    it("should render transactions", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await runResolvedPromises();

      expect(queryByTestId("transactions-list")).toBeInTheDocument();
    });

    it("should render 'Main' as subtitle", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await runResolvedPromises();

      expect(queryByTestId("wallet-page-heading-subtitle").textContent).toBe(
        "Main"
      );
    });

    it("should render a balance with token", async () => {
      const { getByTestId } = render(SnsWallet, props);

      await runResolvedPromises();

      expect(
        getByTestId("wallet-page-heading-component")
          .querySelector('[data-tid="token-value-label"]')
          ?.textContent.trim()
      ).toEqual(
        `${formatToken({
          value: mockSnsMainAccount.balanceUlps,
        })} ${mockSnsToken.symbol}`
      );
    });

    it("should open new transaction modal", async () => {
      const result = render(SnsWallet, props);

      await runResolvedPromises();

      const { queryByTestId, getByTestId } = result;

      await waitFor(() =>
        expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
      );

      await testAccountsModal({ result, testId: "open-new-sns-transaction" });

      expect(getByTestId("transaction-step-1")).toBeInTheDocument();
    });

    it("should make a new transaction", async () => {
      const result = render(SnsWallet, props);

      await runResolvedPromises();

      const { queryByTestId, getByTestId } = result;

      await waitFor(() =>
        expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
      );

      await testAccountsModal({ result, testId: "open-new-sns-transaction" });

      expect(getByTestId("transaction-step-1")).toBeInTheDocument();

      expect(snsLedgerApi.snsTransfer).toHaveBeenCalledTimes(0);

      const destinationAccount = {
        owner: principal(1),
      };
      await testTransferTokens({
        result,
        amount: "2",
        destinationAddress: encodeIcrcAccount(destinationAccount),
      });

      await runResolvedPromises();

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

    it("should open receive modal with sns logo", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await runResolvedPromises();

      await testAccountsModal({ result, testId: "receive-sns" });

      const { getByTestId } = result;

      expect(getByTestId("receive-modal")).not.toBeNull();

      expect(getByTestId("logo").getAttribute("alt")).toEqual(
        `${projectName} project logo`
      );
    });

    it("should reload account after finish receiving tokens", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await runResolvedPromises();

      await testAccountsModal({ result, testId: "receive-sns" });

      const { getByTestId, container } = result;

      await waitModalIntroEnd({
        container,
        selector: "[data-tid='reload-receive-account']",
      });

      // Query + update
      expect(snsLedgerApi.getSnsAccounts).toHaveBeenCalledTimes(2);
      // Transactions can only be fetched from the Index canister with `updated` calls for now.
      expect(snsIndexApi.getSnsTransactions).toHaveBeenCalledTimes(1);

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await runResolvedPromises();

      expect(snsLedgerApi.getSnsAccounts).toHaveBeenCalledTimes(4);
      expect(snsIndexApi.getSnsTransactions).toHaveBeenCalledTimes(2);
    });

    it("should display receive modal information", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await runResolvedPromises();

      await testAccountsModal({ result, testId: "receive-sns" });

      const { getByText } = result;

      const store = get(selectedUniverseStore);

      const title = replacePlaceholders(en.wallet.token_address, {
        $tokenSymbol: store.summary?.token.symbol ?? "error-title-is-undefined",
      });

      expect(getByText(title)).toBeInTheDocument();
    });

    it("should init worker that sync the balance", async () => {
      const spy = vi.spyOn(workerBalances, "initBalancesWorker");

      render(SnsWallet, props);

      await runResolvedPromises();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should init worker that sync the transactions", async () => {
      const spy = vi.spyOn(workerTransactions, "initTransactionsWorker");

      const { queryByTestId } = render(SnsWallet, props);

      await runResolvedPromises();

      expect(queryByTestId("transactions-list")).toBeInTheDocument();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
