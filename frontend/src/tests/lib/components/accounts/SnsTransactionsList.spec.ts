/**
 * @jest-environment jsdom
 */

import SnsTransactionList from "$lib/components/accounts/SnsTransactionsList.svelte";
import { snsTransactionsStore } from "$lib/stores/sns-transactions.store";
import { render, waitFor } from "@testing-library/svelte";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsMainAccount } from "../../../mocks/sns-accounts.mock";
import {
  mockSnsTransactionsStoreSubscribe,
  mockSnsTransactionWithId,
} from "../../../mocks/sns-transactions.mock";

jest.mock("$lib/services/sns-transactions.services", () => {
  // To test loading state as well
  return {
    loadAccountNextTransactions: jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 1000);
        })
    ),
  };
});

describe("SnsTransactionList", () => {
  const renderSnsTransactionList = (account, rootCanisterId) =>
    render(SnsTransactionList, {
      props: {
        account,
        rootCanisterId,
      },
    });

  afterEach(() => jest.clearAllMocks());

  it("renders skeleton when loading transactions", async () => {
    jest
      .spyOn(snsTransactionsStore, "subscribe")
      .mockImplementation(mockSnsTransactionsStoreSubscribe({}));
    const { queryAllByTestId } = renderSnsTransactionList(
      mockSnsMainAccount,
      mockPrincipal
    );

    expect(queryAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("should display no-transactions message", async () => {
    jest
      .spyOn(snsTransactionsStore, "subscribe")
      .mockImplementation(mockSnsTransactionsStoreSubscribe({}));
    const { getByText } = renderSnsTransactionList(
      mockSnsMainAccount,
      mockPrincipal
    );

    await waitFor(() => {
      expect(
        getByText(en.wallet.no_transactions, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("should render transactions", () => {
    const store = {
      [mockPrincipal.toText()]: {
        [mockMainAccount.identifier]: {
          transactions: [mockSnsTransactionWithId],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };
    jest
      .spyOn(snsTransactionsStore, "subscribe")
      .mockImplementation(mockSnsTransactionsStoreSubscribe(store));
    const { queryAllByTestId } = renderSnsTransactionList(
      mockMainAccount,
      mockPrincipal
    );

    expect(queryAllByTestId("transaction-card").length).toBe(1);
  });
});
