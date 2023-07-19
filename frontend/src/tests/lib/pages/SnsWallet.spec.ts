import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
import SnsWallet from "$lib/pages/SnsWallet.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import * as services from "$lib/services/sns-transactions.services";
import * as workerBalances from "$lib/services/worker-balances.services";
import * as workerTransactions from "$lib/services/worker-transactions.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { waitModalIntroEnd } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { mockTokensSubscribe } from "$tests/mocks/tokens.mock";
import { testAccountsModal } from "$tests/utils/accounts.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import AccountsTest from "./AccountsTest.svelte";

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/sns-transactions.services", () => {
  return {
    loadSnsAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadSnsAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

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

  const responses = snsResponseFor({
    principal: mockPrincipal,
    lifecycle: SnsSwapLifecycle.Committed,
  });

  const rootCanisterIdText = responses[0][0].rootCanisterId;
  const rootCanisterId = Principal.fromText(rootCanisterIdText);

  beforeEach(() => {
    snsQueryStore.reset();
    snsAccountsStore.reset();
    transactionsFeesStore.reset();
    snsQueryStore.setData(responses);
    transactionsFeesStore.setFee({
      rootCanisterId,
      fee: BigInt(10_000),
      certified: true,
    });
  });

  describe("accounts not loaded", () => {
    beforeEach(() => {
      // Load accounts in a different project
      snsAccountsStore.setAccounts({
        rootCanisterId: Principal.fromText("aaaaa-aa"),
        accounts: [mockSnsMainAccount],
        certified: true,
      });

      page.mock({ data: { universe: rootCanisterIdText } });
    });
    it("should render a spinner while loading", () => {
      const { getByTestId } = render(SnsWallet, props);

      expect(getByTestId("spinner")).not.toBeNull();
    });

    it("should call to load sns accounts and transaction fee", async () => {
      render(SnsWallet, props);

      await waitFor(() => expect(syncSnsAccounts).toBeCalled());
    });
  });

  describe("accounts loaded", () => {
    beforeAll(() => {
      vi.spyOn(tokensStore, "subscribe").mockImplementation(
        mockTokensSubscribe({
          [rootCanisterIdText]: {
            token: mockSnsToken,
            certified: true,
          },
        })
      );
    });

    beforeEach(() => {
      snsAccountsStore.setAccounts({
        rootCanisterId,
        accounts: [mockSnsMainAccount],
        certified: true,
      });

      page.mock({ data: { universe: rootCanisterIdText } });

      vi.clearAllMocks();
    });

    it("should render sns project name", async () => {
      const { getByTestId } = render(SnsWallet, props);

      const titleRow = getByTestId("projects-summary");

      expect(titleRow).not.toBeNull();
    });

    it("should hide spinner when selected account is loaded", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await waitFor(() => expect(queryByTestId("spinner")).toBeNull());
    });

    it("should render wallet summary and transactions", async () => {
      const { queryByTestId } = render(SnsWallet, props);

      await waitFor(() =>
        expect(queryByTestId("wallet-summary")).toBeInTheDocument()
      );
      await waitFor(() =>
        expect(queryByTestId("transactions-list")).toBeInTheDocument()
      );
    });

    it("should render a balance with token", async () => {
      const { getByTestId } = render(SnsWallet, props);

      await waitFor(() =>
        expect(getByTestId("token-value-label")).not.toBeNull()
      );

      expect(getByTestId("token-value-label")?.textContent.trim()).toEqual(
        `${formatToken({
          value: mockSnsMainAccount.balanceE8s,
        })} ${mockSnsToken.symbol}`
      );
    });

    it("should open new transaction modal", async () => {
      const result = render(SnsWallet, props);

      const { queryByTestId, getByTestId } = result;

      await waitFor(() =>
        expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
      );

      await testAccountsModal({ result, testId: "open-new-sns-transaction" });

      await waitFor(() => {
        expect(getByTestId("transaction-step-1")).toBeInTheDocument();
      });
    });

    const modalProps = {
      ...props,
      testComponent: SnsWallet,
    };

    it("should open receive modal", async () => {
      const result = render(AccountsTest, { props: modalProps });

      await testAccountsModal({ result, testId: "receive-sns" });

      const { getByTestId } = result;

      expect(getByTestId("receive-modal")).not.toBeNull();
    });

    it("should reload account after finish receiving tokens", async () => {
      const spyLoadSnsAccountTransactions = vi.spyOn(
        services,
        "loadSnsAccountTransactions"
      );

      const result = render(AccountsTest, { props: modalProps });

      await testAccountsModal({ result, testId: "receive-sns" });

      const { getByTestId, container } = result;

      await waitModalIntroEnd({
        container,
        selector: "[data-tid='reload-receive-account']",
      });

      fireEvent.click(
        getByTestId("reload-receive-account") as HTMLButtonElement
      );

      await waitFor(() => expect(syncSnsAccounts).toHaveBeenCalled());
      expect(spyLoadSnsAccountTransactions).toHaveBeenCalled();
    });

    it("should display receive modal information", async () => {
      const result = render(AccountsTest, { props: modalProps });

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

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should init worker that sync the transactions", async () => {
      const spy = vi.spyOn(workerTransactions, "initTransactionsWorker");

      const { queryByTestId } = render(SnsWallet, props);

      await waitFor(() =>
        expect(queryByTestId("transactions-list")).toBeInTheDocument()
      );

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
