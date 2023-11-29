import SnsTransactionList from "$lib/components/accounts/SnsTransactionsList.svelte";
import * as services from "$lib/services/sns-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  mockIcrcTransactionsStoreSubscribe,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/sns-transactions.services", () => {
  return {
    loadSnsAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
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

describe("SnsTransactionList", () => {
  const renderSnsTransactionList = (account, rootCanisterId) =>
    render(SnsTransactionList, {
      props: {
        account,
        rootCanisterId,
        token: mockSnsToken,
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
  });

  it("should call service to load transactions", () => {
    const spy = vi.spyOn(services, "loadSnsAccountNextTransactions");

    renderSnsTransactionList(mockSnsMainAccount, mockPrincipal);

    expect(spy).toBeCalled();
  });

  it("should render transactions from store", () => {
    const store = {
      [mockSnsFullProject.rootCanisterId.toText()]: {
        [mockSnsMainAccount.identifier]: {
          transactions: [mockIcrcTransactionWithId],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

    const { queryAllByTestId } = renderSnsTransactionList(
      mockSnsMainAccount,
      mockSnsFullProject.rootCanisterId
    );

    expect(queryAllByTestId("transaction-card").length).toBe(1);
  });
});
