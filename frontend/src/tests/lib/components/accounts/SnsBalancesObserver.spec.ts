import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { syncStore } from "$lib/stores/sync.store";
import type { Account } from "$lib/types/account";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type { PostMessage } from "$lib/types/post-messages";
import { page } from "$mocks/$app/stores";
import SnsBalancesObserverTest from "$tests/lib/components/accounts/SnsBalancesObserverTest.svelte";
import { PostMessageMock } from "$tests/mocks/post-message.mocks";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { vi } from "vitest";

describe("SnsBalancesObserver", () => {
  type BalancesMessageEvent = MessageEvent<
    PostMessage<PostMessageDataResponseBalances | PostMessageDataResponseSync>
  >;

  let postMessageMock: PostMessageMock<BalancesMessageEvent>;

  beforeEach(() => {
    vi.spyOn(snsProjectsStore, "subscribe").mockImplementation(
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

    vi.mock("$lib/workers/balances.worker?worker", () => {
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

        onmessage = async (_params: BalancesMessageEvent) => {
          // Nothing here
        };
      };
    });
  });

  it("should init data and render slotted content", async () => {
    const { getByTestId } = render(SnsBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());
  });

  it("should update account store on new sync message", async () => {
    const { getByTestId } = render(SnsBalancesObserverTest);

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

  it("should populate error to sync store on error message from worker", async () => {
    const { getByTestId } = render(SnsBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());

    const store = get(syncStore);
    expect(store).toEqual({
      balances: "idle",
      transactions: "idle",
    });

    await waitFor(() => expect(postMessageMock.ready).toBeTruthy());

    postMessageMock.emit({
      data: {
        msg: "nnsSyncErrorBalances",
      },
    } as BalancesMessageEvent);

    await waitFor(() => {
      const updatedStore = get(syncStore);
      expect(updatedStore).toEqual({
        balances: "error",
        transactions: "idle",
      });
    });
  });
});
