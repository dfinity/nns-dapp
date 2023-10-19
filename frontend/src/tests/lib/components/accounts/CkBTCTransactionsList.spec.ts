import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockIcrcTransactionBurn,
  mockIcrcTransactionMint,
  mockIcrcTransactionWithId,
  mockIcrcTransactionsStoreSubscribe,
} from "$tests/mocks/icrc-transactions.mock";
import { advanceTime } from "$tests/utils/timers.test-utils";
import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadCkBTCAccountTransactions: vi.fn().mockResolvedValue(undefined),
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

describe("CkBTCTransactionList", () => {
  const renderCkBTCTransactionList = () =>
    render(CkBTCTransactionsList, {
      props: {
        account: mockCkBTCMainAccount,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
        token: mockCkBTCToken,
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers().setSystemTime(new Date());
  });

  afterAll(() => vi.useRealTimers());

  it("should call service to load transactions", () => {
    const spy = vi.spyOn(services, "loadCkBTCAccountNextTransactions");

    renderCkBTCTransactionList();

    expect(spy).toBeCalled();
  });

  it("should call service to load transactions on imperative function call", async () => {
    const spy = vi.spyOn(services, "loadCkBTCAccountNextTransactions");
    const spyReload = vi.spyOn(services, "loadCkBTCAccountTransactions");

    const { component } = render(CkBTCTransactionsList, {
      props: {
        account: mockCkBTCMainAccount,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
        token: mockCkBTCToken,
      },
    });

    await waitFor(() => expect(component.loading).toBeTruthy());
    await waitFor(() => expect(component.loading).toBeFalsy());

    expect(spy).toBeCalledTimes(1);
    expect(spyReload).toBeCalledTimes(0);

    component.reloadTransactions();

    await advanceTime(5000);

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

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

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

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

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

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

    const { getByTestId } = renderCkBTCTransactionList();

    expect(getByTestId("transaction-description")?.textContent).toEqual(
      "From: BTC Network"
    );
  });
});
