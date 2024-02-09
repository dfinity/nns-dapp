import {
  CKTESTBTC_LEDGER_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { syncStore } from "$lib/stores/sync.store";
import type { Account } from "$lib/types/account";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import type { PostMessage } from "$lib/types/post-messages";
import { page } from "$mocks/$app/stores";
import IcrcBalancesObserverTest from "$tests/lib/components/accounts/IcrcBalancesObserverTest.svelte";
import { mockCkBTCMainAccount } from "$tests/mocks/ckbtc-accounts.mock";
import { PostMessageMock } from "$tests/mocks/post-message.mocks";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("IcrcBalancesObserver", () => {
  type BalancesMessageEvent = MessageEvent<
    PostMessage<PostMessageDataResponseBalances | PostMessageDataResponseSync>
  >;

  let postMessageMock: PostMessageMock<BalancesMessageEvent>;

  beforeEach(() => {
    const accounts: Account[] = [mockCkBTCMainAccount];
    icrcAccountsStore.set({
      ledgerCanisterId: CKTESTBTC_LEDGER_CANISTER_ID,
      accounts: { accounts, certified: true },
    });

    page.mock({
      routeId: AppPath.Wallet,
      data: { universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() },
    });

    postMessageMock = new PostMessageMock();

    vi.doMock("$lib/workers/balances.worker?worker", () => ({
      default: class BalancesWorker {
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
      },
    }));
  });

  it("should init data and render slotted content", async () => {
    const { getByTestId } = render(IcrcBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());
  });

  it("should update account store on new sync message", async () => {
    const { getByTestId } = render(IcrcBalancesObserverTest);

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());

    const accountsInStore = get(icrcAccountsStore);
    expect(
      accountsInStore[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()].accounts
    ).toEqual([mockCkBTCMainAccount]);

    await waitFor(() => expect(postMessageMock.ready).toBeTruthy());

    postMessageMock.emit({
      data: {
        msg: "nnsSyncBalances",
        data: {
          balances: [
            {
              accountIdentifier: mockCkBTCMainAccount.identifier,
              balance: 123456n,
            },
          ],
        },
      },
    } as BalancesMessageEvent);

    await waitFor(() => {
      const updatedStore = get(icrcAccountsStore);
      expect(
        updatedStore[CKTESTBTC_UNIVERSE_CANISTER_ID.toText()].accounts
      ).toEqual([{ ...mockCkBTCMainAccount, balanceUlps: 123456n }]);
    });
  });

  it("should populate error to sync store on error message from worker", async () => {
    const { getByTestId } = render(IcrcBalancesObserverTest);

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

  it("should reload on new sync message", async () => {
    const spyReload = vi.fn();
    const { getByTestId } = render(IcrcBalancesObserverTest, {
      props: {
        reload: spyReload,
      },
    });

    await waitFor(() => expect(getByTestId("test-observer")).not.toBeNull());

    expect(spyReload).not.toHaveBeenCalled();

    await waitFor(() => expect(postMessageMock.ready).toBeTruthy());

    postMessageMock.emit({
      data: {
        msg: "nnsSyncBalances",
        data: {
          balances: [
            {
              accountIdentifier: mockCkBTCMainAccount.identifier,
              balance: 123456n,
            },
          ],
        },
      },
    } as BalancesMessageEvent);

    await waitFor(() => expect(spyReload).toHaveBeenCalledTimes(1));
  });
});
