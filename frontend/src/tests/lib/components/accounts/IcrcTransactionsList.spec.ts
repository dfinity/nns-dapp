import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import type { UiTransaction } from "$lib/types/transaction";
import { mockIcrcTransactionsStoreSubscribe } from "$tests/mocks/icrc-transactions.mock";
import { createMockUiTransaction } from "$tests/mocks/transaction.mock";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IcrcTransactionList", () => {
  const renderComponent = ({
    transactions,
    loading,
    completed = false,
  }: {
    transactions: UiTransaction[];
    loading?: boolean;
    completed?: boolean;
  }) => {
    const { container } = render(IcrcTransactionsList, {
      props: {
        transactions,
        loading,
        completed,
      },
    });
    return IcrcTransactionsListPo.under(new JestPageObjectElement(container));
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton when loading transactions", async () => {
    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe({})
    );

    const po = renderComponent({
      transactions: [],
      loading: true,
    });

    expect(await po.getSkeletonCardPo().isPresent()).toBe(true);
  });

  it("should display no-transactions message", async () => {
    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe({})
    );

    const po = renderComponent({
      transactions: [],
      loading: false,
      completed: true,
    });

    expect(await po.hasNoTransactions()).toBe(true);
  });

  it("should render transactions", async () => {
    const po = renderComponent({
      transactions: [
        createMockUiTransaction({ domKey: "1-1" }),
        createMockUiTransaction({ domKey: "2-1" }),
      ],
      loading: false,
      completed: true,
    });

    expect(await po.getTransactionCardPos()).toHaveLength(2);
    expect(await po.hasNoTransactions()).toBe(false);
  });
});
