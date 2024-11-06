import CkBTCTransactionsList from "$lib/components/accounts/CkBTCTransactionsList.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { ckBTCInfoStore } from "$lib/stores/ckbtc-info.store";
import { ckbtcPendingUtxosStore } from "$lib/stores/ckbtc-pending-utxos.store";
import { ckbtcRetrieveBtcStatusesStore } from "$lib/stores/ckbtc-retrieve-btc-statuses.store";
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
import { UiTransactionsListPo } from "$tests/page-objects/UiTransactionsList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Cbor } from "@dfinity/agent";
import type { RetrieveBtcStatusV2 } from "@dfinity/ckbtc";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/icrc-transactions.services", () => {
  return {
    loadIcrcAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadIcrcAccountTransactions: vi.fn().mockResolvedValue(undefined),
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
      po: UiTransactionsListPo.under(new JestPageObjectElement(container)),
      reload: component.reloadTransactions,
    };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    ckbtcPendingUtxosStore.reset();
    ckbtcRetrieveBtcStatusesStore.reset();
    vi.useFakeTimers().setSystemTime(new Date());
  });

  it("should render burn without memo as BTC Sent to BTC Network", async () => {
    const errorLog = [];
    vi.spyOn(console, "error").mockImplementation((msg) => {
      errorLog.push(msg);
    });
    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: 123n,
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
          oldestTxId: 0n,
        },
      },
    };

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

    const { po } = renderComponent();
    const cards = await po.getTransactionCardPos();

    expect(cards).toHaveLength(1);
    expect(await cards[0].getHeadline()).toEqual("BTC Sent");
    expect(await cards[0].getIdentifier()).toEqual("To: BTC Network");
    expect(errorLog).toEqual(["Failed to decode ckBTC burn memo"]);
  });

  it("should render burn as BTC Sent to withdrawal address", async () => {
    const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
    const kytFee = 1334;
    const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
    const memo = new Uint8Array(Cbor.encode(decodedMemo));

    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: 123n,
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
          oldestTxId: 0n,
        },
      },
    };

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

    const { po } = renderComponent();
    const cards = await po.getTransactionCardPos();

    expect(cards).toHaveLength(1);
    expect(await cards[0].getHeadline()).toEqual("BTC Sent");
    expect(await cards[0].getIdentifier()).toEqual(
      `To: ${btcWithdrawalAddress}`
    );
  });

  it("should render burn tx with failed status as failed", async () => {
    const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
    const kytFee = 1334;
    const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
    const memo = new Uint8Array(Cbor.encode(decodedMemo));

    const amount = 278_000n;
    const transactionId = 742n;
    const failedStatus: RetrieveBtcStatusV2 = {
      Reimbursed: {
        account: {
          owner: mockCkBTCMainAccount.principal,
          subaccount: [],
        },
        mint_block_index: 744n,
        amount: amount - BigInt(kytFee),
        reason: {
          CallFailed: null,
        },
      },
    };
    ckbtcRetrieveBtcStatusesStore.setForUniverse({
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
      statuses: [
        {
          id: transactionId,
          status: failedStatus,
        },
      ],
    });

    const store = {
      [CKBTC_UNIVERSE_CANISTER_ID.toText()]: {
        [mockCkBTCMainAccount.identifier]: {
          transactions: [
            {
              id: transactionId,
              transaction: createBurnTransaction({
                amount,
                memo,
                from: {
                  owner: mockCkBTCMainAccount.principal,
                  subaccount: [],
                },
              }),
            },
          ],
          completed: false,
          oldestTxId: 0n,
        },
      },
    };

    vi.spyOn(icrcTransactionsStore, "subscribe").mockImplementation(
      mockIcrcTransactionsStoreSubscribe(store)
    );

    const { po } = renderComponent();
    const cards = await po.getTransactionCardPos();

    expect(cards).toHaveLength(1);
    expect(await cards[0].getHeadline()).toBe("Sending BTC failed");
    expect(await cards[0].hasFailedIcon()).toBe(true);
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
              id: 123n,
              transaction: mockIcrcTransactionMint,
            },
          ],
          completed: false,
          oldestTxId: 0n,
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
          oldestTxId: 0n,
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

    expect(await card.getHeadline()).toBe("BTC Sent");
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
    expect(await card.hasPendingReceiveIcon()).toBe(true);
    expect(await card.getHeadline()).toBe("Receiving BTC");
    expect(await card.getIdentifier()).toBe("From: BTC Network");
    // 0.01 deposited minus 0.00004 KYT fee.
    expect(await card.getAmount()).toBe("+0.00996");
    expect(await card.getDate()).toBe("Pending...");
  });
});
