/**
 * @jest-environment jsdom
 */

import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import CkBTCTransactionsListTest from "$tests/lib/components/accounts/CkBTCTransactionsListTest.svelte";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockIcrcTransactionBurn,
  mockIcrcTransactionMint,
  mockIcrcTransactionsStoreSubscribe,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: jest.fn().mockResolvedValue(undefined),
    loadCkBTCAccountTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

describe("CkBTCTransactionList", () => {
  const renderCkBTCTransactionList = () =>
    render(CkBTCTransactionsList, {
      props: {
        account: mockCkBTCMainAccount,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
      },
    });

  afterEach(() => jest.clearAllMocks());

  it("should call service to load transactions", () => {
    const spy = jest.spyOn(services, "loadCkBTCAccountNextTransactions");

    renderCkBTCTransactionList();

    expect(spy).toBeCalled();
  });

  it("should call service to load transactions when account changes", async () => {
    const spy = jest.spyOn(services, "loadCkBTCAccountNextTransactions");
    const spyReload = jest.spyOn(services, "loadCkBTCAccountTransactions");

    const { component } = render(CkBTCTransactionsListTest, {
      props: {
        account: mockCkBTCMainAccount,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
      },
    });

    expect(spy).toBeCalledTimes(1);
    expect(spyReload).toBeCalledTimes(0);

    component.reloadAccount();

    expect(spy).toBeCalledTimes(1);
    await waitFor(() => expect(spyReload).toBeCalledTimes(1));
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

  it("should render description burn to btc network", () => {
    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: BigInt(123),
              transaction: mockIcrcTransactionBurn,
            },
          ],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };

    jest
      .spyOn(icrcTransactionsStore, "subscribe")
      .mockImplementation(mockIcrcTransactionsStoreSubscribe(store));

    const { getByTestId } = renderCkBTCTransactionList();

    expect(getByTestId("transaction-description")?.textContent).toEqual(
      "To: BTC Network"
    );
  });

  it("should render description mint from btc network", () => {
    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: BigInt(123),
              transaction: mockIcrcTransactionMint,
            },
          ],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };

    jest
      .spyOn(icrcTransactionsStore, "subscribe")
      .mockImplementation(mockIcrcTransactionsStoreSubscribe(store));

    const { getByTestId } = renderCkBTCTransactionList();

    expect(getByTestId("transaction-description")?.textContent).toEqual(
      "From: BTC Network"
    );
  });
});
