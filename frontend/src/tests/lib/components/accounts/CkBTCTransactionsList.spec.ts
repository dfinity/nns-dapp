import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import {
  createBurnTransaction,
  mockIcrcTransactionMint,
  mockIcrcTransactionsStoreSubscribe,
} from "$tests/mocks/icrc-transactions.mock";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { Cbor } from "@dfinity/agent";
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

describe("CkBTCTransactionList", () => {
  const renderComponent = () => {
    const { container, component } = render(CkBTCTransactionsList, {
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

  it("should render description burn to btc network", async () => {
    const errorLog = [];
    vi.spyOn(console, "error").mockImplementation((msg) => {
      errorLog.push(msg);
    });
    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: BigInt(123),
              transaction: createBurnTransaction({
                // Missing memo should result in fallback description.
                from: {
                  owner: mockCkBTCMainAccount.principal,
                  subaccount: [],
                },
              }),
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

    const { po } = renderComponent();
    const cards = await po.getTransactionCardPos();

    expect(cards).toHaveLength(1);
    expect(await cards[0].getHeadline()).toEqual("Sent");
    expect(await cards[0].getIdentifier()).toEqual("To: BTC Network");
    expect(errorLog).toEqual(["Failed to decode ckBTC burn memo"]);
  });

  it("should render description burn to btc address", async () => {
    const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
    const kytFee = 1334;
    const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
    const memo = new Uint8Array(Cbor.encode(decodedMemo));

    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: BigInt(123),
              transaction: createBurnTransaction({
                memo,
                from: {
                  owner: mockCkBTCMainAccount.principal,
                  subaccount: [],
                },
              }),
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

    const { po } = renderComponent();
    const cards = await po.getTransactionCardPos();

    expect(cards).toHaveLength(1);
    expect(await cards[0].getHeadline()).toEqual("Sent");
    expect(await cards[0].getIdentifier()).toEqual(
      `To: ${btcWithdrawalAddress}`
    );
  });

  it("should render description mint from btc network", async () => {
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

    const { po } = renderComponent();
    const cards = await po.getTransactionCardPos();

    expect(await cards[0].getIdentifier()).toEqual("From: BTC Network");
  });
});
