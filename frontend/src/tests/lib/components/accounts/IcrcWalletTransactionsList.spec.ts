import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/wallet-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import type {
  IcrcTransactionData,
  UiTransaction,
} from "$lib/types/transaction";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockIcrcTransactionWithId,
  mockIcrcTransactionWithIdToSelf,
  mockIcrcTransactionsStoreSubscribe,
} from "$tests/mocks/icrc-transactions.mock";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/wallet-transactions.services", () => {
  return {
    loadWalletNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadWalletTransactions: vi.fn().mockResolvedValue(undefined),
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

const fakeHeadline = "Fake transaction";
const fakeUiTransaction: UiTransaction = {
  domKey: "1",
  isIncoming: false,
  isPending: false,
  headline: fakeHeadline,
  otherParty: "123",
  tokenAmount: TokenAmount.fromE8s({
    amount: 100_000_000n,
    token: mockCkBTCToken,
  }),
  timestamp: new Date(),
};

describe("IcrcWalletTransactionList", () => {
  const renderComponent = (
    mapTransactions?: (
      txs: IcrcTransactionData[]
    ) => UiTransaction[] | undefined
  ) => {
    const { container, component } = render(IcrcWalletTransactionsList, {
      props: {
        account: mockCkBTCMainAccount,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
        token: mockCkBTCToken,
        mapTransactions,
      },
    });
    return {
      po: IcrcTransactionsListPo.under(new JestPageObjectElement(container)),
      reload: component.reloadTransactions,
    };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers().setSystemTime(new Date());
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should call service to load transactions", () => {
    const spy = vi.spyOn(services, "loadWalletNextTransactions");

    renderComponent();

    expect(spy).toBeCalled();
  });

  it("should call service to load transactions on imperative function call", async () => {
    const spy = vi.spyOn(services, "loadWalletNextTransactions");
    const spyReload = vi.spyOn(services, "loadWalletTransactions");

    let resolveLoadNext;
    spy.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLoadNext = resolve;
        })
    );

    const { po, reload } = renderComponent();

    await runResolvedPromises();
    expect(await po.getSkeletonCardPo().isPresent()).toBe(true);
    resolveLoadNext();
    await runResolvedPromises();
    await po.getSkeletonCardPo().waitForAbsent();

    expect(spy).toBeCalledTimes(1);
    expect(spyReload).toBeCalledTimes(0);

    reload();

    await advanceTime(5000);

    expect(spy).toBeCalledTimes(1);
    expect(spyReload).toBeCalledTimes(1);
  });

  it("should render transactions from store", async () => {
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

    const { po } = renderComponent();

    expect(await po.getTransactionCardPos()).toHaveLength(1);
  });

  it("should render to-self transactions from store as duplicate", async () => {
    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [mockIcrcTransactionWithIdToSelf],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

    const { po } = renderComponent();

    expect(await po.getTransactionCardPos()).toHaveLength(2);
  });

  it("should use custom mapTransactions", async () => {
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

    // Ignores actual transacitons and returns 3 fake transactions.
    const mapTransactions = (_: IcrcTransactionData[]): UiTransaction[] => [
      fakeUiTransaction,
      {
        ...fakeUiTransaction,
        domKey: "2",
      },
      {
        ...fakeUiTransaction,
        domKey: "3",
      },
    ];

    const { po } = renderComponent(mapTransactions);

    const cards = await po.getTransactionCardPos();

    expect(cards).toHaveLength(3);
    expect(await cards[0].getHeadline()).toBe(fakeHeadline);
    expect(await cards[1].getHeadline()).toBe(fakeHeadline);
    expect(await cards[2].getHeadline()).toBe(fakeHeadline);
  });

  it("should display skeletons until transaction are loaded even with additional mapped transaction", async () => {
    const spyLoadNext = vi.spyOn(services, "loadWalletNextTransactions");

    let resolveLoadNext;
    spyLoadNext.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLoadNext = resolve;
        })
    );

    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [],
          completed: false,
          oldestTxId: BigInt(0),
        },
      },
    };

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

    // Ignores actual transacitons and return a fake transactions.
    const mapTransactions = (_: IcrcTransactionData[]): UiTransaction[] => [
      fakeUiTransaction,
    ];

    const { po } = renderComponent(mapTransactions);

    // The fake transactions is not yet displayed while transactions are still
    // loading.
    expect(await po.getSkeletonCardPo().isPresent()).toBe(true);
    expect(await po.getTransactionCardPos()).toHaveLength(0);

    resolveLoadNext();
    await runResolvedPromises();

    expect(await po.getSkeletonCardPo().isPresent()).toBe(false);
    const cards = await po.getTransactionCardPos();
    expect(cards).toHaveLength(1);
    expect(await cards[0].getHeadline()).toBe(fakeHeadline);
  });
});
