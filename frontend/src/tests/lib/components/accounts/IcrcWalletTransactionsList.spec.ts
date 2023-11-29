import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/wallet-transactions.services";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
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

describe("IcrcWalletTransactionList", () => {
  const renderComponent = () => {
    const { container, component } = render(IcrcWalletTransactionsList, {
      props: {
        account: mockCkBTCMainAccount,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
        token: mockCkBTCToken,
      },
    });
    return {
      po: IcrcTransactionsListPo.under(new JestPageObjectElement(container)),
      reload: component.reloadTransactions,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
});
