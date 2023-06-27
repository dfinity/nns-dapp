/**
 * @jest-environment jsdom
 */

import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Account } from "$lib/types/account";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type { PostMessage } from "$lib/types/post-messages";
import { page } from "$mocks/$app/stores";
import SnsWalletBalancesObserverTest from "$tests/lib/components/accounts/SnsWalletBalancesObserverTest.svelte";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { nonNullish } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("SnsWalletBalancesObserver", () => {
  type BalancesMessageEvent = MessageEvent<
    PostMessage<PostMessageDataResponseBalances | PostMessageDataResponseSync>
  >;

  class PostMessageMock {
    private _callback:
      | ((params: BalancesMessageEvent) => Promise<void>)
      | undefined;

    subscribe(callback: (params: BalancesMessageEvent) => Promise<void>) {
      this._callback = callback;
    }

    emit(params: BalancesMessageEvent) {
      this._callback?.(params);
    }

    get ready(): boolean {
      return nonNullish(this._callback);
    }
  }

  let postMessageMock: PostMessageMock;

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

    jest.mock("$lib/workers/balances.worker?worker", () => {
      return class BalancesWorker {
        constructor() {
          postMessageMock.subscribe(async (msg) => await this.onmessage(msg));
        }

        postMessage(_data: {
          msg: "nnsStartBalancesTimer" | "nnsStopBalancesTimer";
          data?: PostMessageDataRequestBalances;
        }) {
          // Nothing here
        }

        onmessage = async (
          _params: MessageEvent<
            PostMessage<
              PostMessageDataResponseBalances | PostMessageDataResponseSync
            >
          >
        ) => {
          // Nothing here
        };
      };
    });
  });

  it("should init data and render slotted content", async () => {
    const { getByTestId } = render(SnsWalletBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());
  });

  it("should update account store on new message", async () => {
    const { getByTestId } = render(SnsWalletBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());

    const accountsInStore = get(snsAccountsStore);
    expect(accountsInStore[rootCanisterIdMock.toText()].accounts).toEqual([
      mockSnsMainAccount,
    ]);

    await waitFor(() => expect(postMessageMock.ready).toBeTruthy());

    postMessageMock.emit({
      data: {
        msg: "nnsSyncBalances",
        data: {
          balances: [
            {
              accountIdentifier: mockSnsMainAccount.identifier,
              balance: 123456n,
            },
          ],
        },
      },
    } as BalancesMessageEvent);

    await waitFor(() => {
      const updatedStore = get(snsAccountsStore);
      expect(updatedStore[rootCanisterIdMock.toText()].accounts).toEqual([
        { ...mockSnsMainAccount, balanceE8s: 123456n },
      ]);
    });
  });
});
