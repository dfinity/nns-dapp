import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import type { Account } from "$lib/types/account";
import type { IcrcTransactionData } from "$lib/types/transaction";
import {
  mockIcrcTransactionsStoreSubscribe,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IcrcTransactionList", () => {
  const renderComponent = ({
    account,
    transactions,
    loading,
    completed = false,
  }: {
    account: Account;
    transactions: IcrcTransactionData[];
    loading?: boolean;
    completed?: boolean;
  }) => {
    const { container } = render(IcrcTransactionsList, {
      props: {
        account,
        transactions,
        loading,
        completed,
        token: mockSnsToken,
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
      account: mockSnsMainAccount,
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
      account: mockSnsMainAccount,
      transactions: [],
      loading: false,
      completed: true,
    });

    expect(await po.getText()).toBe("No transactions");
  });

  it("should render transactions", async () => {
    const po = renderComponent({
      account: mockSnsMainAccount,
      transactions: [
        {
          transaction: mockIcrcTransactionWithId,
          toSelfTransaction: false,
        },
      ],
      loading: false,
      completed: true,
    });

    expect(await po.getTransactionCardPos()).toHaveLength(1);
  });
});
