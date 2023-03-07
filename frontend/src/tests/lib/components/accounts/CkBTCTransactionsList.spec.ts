/**
 * @jest-environment jsdom
 */

import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { render } from "@testing-library/svelte";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockIcrcTransactionsStoreSubscribe,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

describe("CkBTCTransactionList", () => {
  const renderCkBTCTransactionList = () =>
    render(CkBTCTransactionsList, {
      props: {
        account: mockCkBTCMainAccount,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        canisters: mockCkBTCAdditionalCanisters,
      },
    });

  afterEach(() => jest.clearAllMocks());

  it("should call service to load transactions", () => {
    const spy = jest.spyOn(services, "loadCkBTCAccountNextTransactions");

    renderCkBTCTransactionList();

    expect(spy).toBeCalled();
  });

  it("should render transactions from store", () => {
    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [mockIcrcTransactionWithId],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };

    jest
      .spyOn(icrcTransactionsStore, "subscribe")
      .mockImplementation(mockIcrcTransactionsStoreSubscribe(store));

    const { queryAllByTestId } = renderCkBTCTransactionList();

    expect(queryAllByTestId("transaction-card").length).toBe(1);
  });
});
