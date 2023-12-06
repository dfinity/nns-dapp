import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { ckbtcPendingUtxosStore } from "$lib/stores/ckbtc-pending-utxos.store";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkBTCMinterInfo } from "$tests/mocks/ckbtc-minter.mock";
import {
  createApproveTransaction,
  createBurnTransaction,
  mockIcrcTransactionMint,
  mockIcrcTransactionsStoreSubscribe,
} from "$tests/mocks/icrc-transactions.mock";
import { IcrcTransactionsListPo } from "$tests/page-objects/IcrcTransactionsList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
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
    vi.restoreAllMocks();
    ckbtcPendingUtxosStore.reset();
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

  it("should merge Approve with corresponding Burn", async () => {
    const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
    const kytFee = 3000;
    const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
    const burnMemo = new Uint8Array(Cbor.encode(decodedMemo));

    const burnAmount = 300_000_000n;
    const approveFee = 14n;

    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: 201n,
              transaction: createBurnTransaction({
                amount: burnAmount,
                from: {
                  owner: mockCkBTCMainAccount.principal,
                  subaccount: [],
                },
                memo: burnMemo,
              }),
            },
            {
              id: 202n,
              transaction: createApproveTransaction({
                fee: approveFee,
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
    const card = cards[0];

    expect(await card.getHeadline()).toBe("Sent");
    expect(await card.getIdentifier()).toBe(`To: ${btcWithdrawalAddress}`);
    // This is the burned amount + approve fee. The KYT fee is deducted after
    // burning.
    expect(await card.getAmount()).toBe("-3.00000014");
  });

  it("should render pending UTXOs", async () => {
    const amount = 1000_000n;
    const kytFee = 4_000n;
    const utxo = {
      outpoint: {
        txid: new Uint8Array([2, 5, 5]),
        vout: 1,
      },
      value: amount,
      confirmations: 4,
    };
    ckbtcPendingUtxosStore.setUtxos({
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
      utxos: [utxo],
    });

    ckBTCInfoStore.setInfo({
      canisterId: CKBTC_UNIVERSE_CANISTER_ID,
      certified: true,
      info: {
        ...mockCkBTCMinterInfo,
        kyt_fee: kytFee,
      },
    });

    const { po } = renderComponent();
    await runResolvedPromises();
    const cards = await po.getTransactionCardPos();

    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(await card.hasPendingIcon()).toBe(true);
    expect(await card.getHeadline()).toBe("Receiving BTC");
    expect(await card.getIdentifier()).toBe("From: BTC Network");
    // 0.01 deposited minus 0.00004 KYT fee.
    expect(await card.getAmount()).toBe("+0.00996");
    expect(await card.getDate()).toBe("Pending...");
  });
});
