import IcrcTransactionsList from "$lib/components/accounts/IcrcTransactionsList.svelte";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import type { Account } from "$lib/types/account";
import type { IcrcTransactionData } from "$lib/types/transaction";
import en from "$tests/mocks/i18n.mock";
import {
  mockIcrcTransactionsStoreSubscribe,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { render, waitFor } from "@testing-library/svelte";

describe("IcrcTransactionList", () => {
  const renderIcrcTransactionList = ({
    account,
    transactions,
    loading,
    completed = false,
  }: {
    account: Account;
    transactions: IcrcTransactionData[];
    loading?: boolean;
    completed?: boolean;
  }) =>
    render(IcrcTransactionsList, {
      props: {
        account,
        transactions,
        loading,
        completed,
        token: mockSnsToken,
      },
    });

  afterEach(() => vi.clearAllMocks());

  it("renders skeleton when loading transactions", async () => {
    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe({})
    );

    const { queryAllByTestId } = renderIcrcTransactionList({
      account: mockSnsMainAccount,
      transactions: [],
      loading: true,
    });

    expect(queryAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("should display no-transactions message", async () => {
    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe({})
    );

    const { getByText } = renderIcrcTransactionList({
      account: mockSnsMainAccount,
      transactions: [],
      loading: false,
      completed: true,
    });

    await waitFor(() => {
      expect(
        getByText(en.wallet.no_transactions, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("should render transactions", () => {
    const { queryAllByTestId } = renderIcrcTransactionList({
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

    expect(queryAllByTestId("transaction-card").length).toBe(1);
  });
});
