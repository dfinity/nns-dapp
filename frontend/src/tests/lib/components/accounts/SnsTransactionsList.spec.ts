/**
 * @jest-environment jsdom
 */

import SnsTransactionList from "$lib/components/accounts/SnsTransactionsList.svelte";
import * as services from "$lib/services/sns-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  mockIcrcTransactionsStoreSubscribe,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { render } from "@testing-library/svelte";

jest.mock("$lib/services/sns-transactions.services", () => {
  return {
    loadSnsAccountNextTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SnsTransactionList", () => {
  const renderSnsTransactionList = (account, rootCanisterId) =>
    render(SnsTransactionList, {
      props: {
        account,
        rootCanisterId,
        token: mockSnsToken,
      },
    });

  afterEach(() => jest.clearAllMocks());

  it("should call service to load transactions", () => {
    const spy = jest.spyOn(services, "loadSnsAccountNextTransactions");

    renderSnsTransactionList(mockSnsMainAccount, mockPrincipal);

    expect(spy).toBeCalled();
  });

  it("should render transactions from store", () => {
    const store = {
      [mockPrincipal.toText()]: {
        [mockSnsMainAccount.identifier]: {
          transactions: [mockIcrcTransactionWithId],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };

    jest
      .spyOn(icrcTransactionsStore, "subscribe")
      .mockImplementation(mockIcrcTransactionsStoreSubscribe(store));

    const { queryAllByTestId } = renderSnsTransactionList(
      mockSnsMainAccount,
      mockPrincipal
    );

    expect(queryAllByTestId("transaction-card").length).toBe(1);
  });
});
