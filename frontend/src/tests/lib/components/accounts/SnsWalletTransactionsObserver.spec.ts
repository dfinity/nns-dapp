/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { syncStore } from "$lib/stores/sync.store";
import type { Account } from "$lib/types/account";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type {
  PostMessageDataRequestTransactions,
  PostMessageDataResponseTransactions,
} from "$lib/types/post-message.transactions";
import type { PostMessage } from "$lib/types/post-messages";
import { page } from "$mocks/$app/stores";
import SnsWalletTransactionsObserverTest from "$tests/lib/components/accounts/SnsWalletTransactionsObserverTest.svelte";
import { PostMessageMock } from "$tests/mocks/post-message.mocks";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SnsWalletTransactionsObserver", () => {
  type TransactionsMessageEvent = MessageEvent<
    PostMessage<
      PostMessageDataResponseTransactions | PostMessageDataResponseSync
    >
  >;

  let postMessageMock: PostMessageMock<TransactionsMessageEvent>;

  beforeEach(() => {
    jest.spyOn(snsProjectsStore, "subscribe").mockImplementation(
      mockProjectSubscribe([
        {
          ...mockSnsFullProject,
          rootCanisterId: rootCanisterIdMock,
        },
      ])
    );

    const accounts: Account[] = [mockSnsMainAccount];
    snsAccountsStore.setAccounts({
      rootCanisterId: rootCanisterIdMock,
      accounts,
      certified: true,
    });

    page.mock({
      routeId: AppPath.Wallet,
      data: { universe: rootCanisterIdMock.toText() },
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
    const { getByTestId } = render(SnsWalletTransactionsObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());
  });

  xit("should update account store on new sync message", async () => {
    const { getByTestId } = render(SnsWalletTransactionsObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());

    const transactionsStore = get(icrcTransactionsStore);
    expect(transactionsStore[mockSnsMainAccount.identifier]).toEqual({});

    await waitFor(() => expect(postMessageMock.ready).toBeTruthy());

    postMessageMock.emit({
      data: {
        msg: "nnsSyncTransactions",
        data: {
          transactions: [],
        },
      },
    } as TransactionsMessageEvent);

    await waitFor(() => {
      const updatedStore = get(icrcTransactionsStore);
      expect(updatedStore[mockSnsMainAccount.identifier]).toEqual([
        { ...mockSnsMainAccount, balanceE8s: 123456n },
      ]);
    });
  });

  it("should populate error to sync store on error message from worker", async () => {
    const { getByTestId } = render(SnsWalletTransactionsObserverTest);

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
