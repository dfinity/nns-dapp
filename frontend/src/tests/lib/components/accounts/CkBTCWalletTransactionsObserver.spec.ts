/**
 * @jest-environment jsdom
 */

import { CKTESTBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { syncStore } from "$lib/stores/sync.store";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransactions,
} from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { page } from "$mocks/$app/stores";
import CkBTCWalletTransactionsObserverTest from "$tests/lib/components/accounts/CkBTCWalletTransactionsObserverTest.svelte";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import {
  mockIcrcTransactionMint,
  mockIcrcTransactionWithId,
} from "$tests/mocks/icrc-transactions.mock";
import { PostMessageMock } from "$tests/mocks/post-message.mocks";
import { jsonReplacer } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("CkBTCWalletTransactionsObserver", () => {
  type TransactionsMessageEvent = MessageEvent<
    PostMessage<
      PostMessageDataResponseTransactions | PostMessageDataResponseSync
    >
  >;

  let postMessageMock: PostMessageMock<TransactionsMessageEvent>;

  const transaction = {
    canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID,
    transactions: [mockIcrcTransactionWithId],
    accountIdentifier: mockCkBTCMainAccount.identifier,
    oldestTxId: BigInt(10),
    completed: false,
  };

  beforeEach(() => {
    icrcTransactionsStore.addTransactions(transaction);

    page.mock({
      routeId: AppPath.Wallet,
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
    });

    postMessageMock = new PostMessageMock();

    jest.mock("$lib/workers/transactions.worker?worker", () => {
      return class TransactionsWorker {
        constructor() {
          postMessageMock.subscribe(async (msg) => await this.onmessage(msg));
        }

        postMessage(_data: {
          msg: "nnsStartTransactionsTimer" | "nnsStopTransactionsTimer";
          data?: PostMessageDataRequestTransactions;
        }) {
          // Nothing here
        }

        onmessage = async (_params: TransactionsMessageEvent) => {
          // Nothing here
        };
      };
    });
  });

  it("should init data and render slotted content", async () => {
    const { getByTestId } = render(CkBTCWalletTransactionsObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());
  });

  it("should update account store on new sync message", async () => {
    const { getByTestId } = render(CkBTCWalletTransactionsObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());

    const transactionsStore = get(icrcTransactionsStore);

    expect(transactionsStore[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]).toEqual({
      [mockCkBTCMainAccount.identifier]: {
        transactions: transaction.transactions,
        completed: transaction.completed,
        oldestTxId: transaction.oldestTxId,
      },
    });

    await waitFor(() => expect(postMessageMock.ready).toBeTruthy());

    const oldestTxId = transaction.oldestTxId - 1n;

    postMessageMock.emit({
      data: {
        msg: "nnsSyncTransactions",
        data: {
          transactions: [
            {
              accountIdentifier: mockCkBTCMainAccount.identifier,
              transactions: JSON.stringify(
                [mockIcrcTransactionMint],
                jsonReplacer
              ),
              oldestTxId,
            },
          ],
        },
      },
    } as TransactionsMessageEvent);

    await waitFor(() => {
      const updatedStore = get(icrcTransactionsStore);
      expect(updatedStore[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()]).toEqual({
        [mockCkBTCMainAccount.identifier]: {
          transactions: [...transaction.transactions, mockIcrcTransactionMint],
          completed: true,
          oldestTxId,
        },
      });
    });
  });

  it("should populate error to sync store on error message from worker", async () => {
    const { getByTestId } = render(CkBTCWalletTransactionsObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());

    const store = get(syncStore);
    expect(store).toEqual({
      balances: "idle",
      transactions: "idle",
    });

    await waitFor(() => expect(postMessageMock.ready).toBeTruthy());

    postMessageMock.emit({
      data: {
        msg: "nnsSyncErrorTransactions",
      },
    } as TransactionsMessageEvent);

    await waitFor(() => {
      const updatedStore = get(syncStore);
      expect(updatedStore).toEqual({
        balances: "idle",
        transactions: "error",
      });
    });
  });
});
