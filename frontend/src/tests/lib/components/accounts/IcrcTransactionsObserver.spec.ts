import IcrcTransactionsObserver from "$lib/components/accounts/IcrcTransactionsObserver.svelte";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import type { TransactionsObserverData } from "$lib/types/icrc.observer";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import { indexCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("IcrcTransactionsObserver", () => {
  let spyPostMessage;

  beforeEach(() => {
    spyPostMessage = vi.fn();

    vi.mock("$lib/workers/transactions.worker?worker", () => {
      return class TransactionsWorker {
        postMessage(data: {
          msg: "nnsStartTransactionsTimer";
          data: PostMessageDataRequestTransactions;
        }) {
          spyPostMessage(data);
        }
      };
    });
  });

  const data: TransactionsObserverData = {
    indexCanisterId: indexCanisterIdMock.toText(),
    account: mockMainAccount,
  };

  it("should init worker with parameters", async () => {
    render(IcrcTransactionsObserver, {
      props: {
        data,
        callback: vi.fn(),
      },
    });

    await waitFor(() =>
      expect(spyPostMessage).toBeCalledWith({
        msg: "nnsStartTransactionsTimer",
        data: {
          indexCanisterId: data.indexCanisterId,
          accountIdentifiers: [data.account.identifier],
          host: HOST,
          fetchRootKey: FETCH_ROOT_KEY,
        },
      })
    );
  });

  it("should stop worker on destroy", async () => {
    const { unmount } = render(IcrcTransactionsObserver, {
      props: {
        data,
        callback: vi.fn(),
      },
    });

    await waitFor(() => expect(spyPostMessage).toHaveBeenCalledTimes(1));

    unmount();

    await waitFor(() => expect(spyPostMessage).toHaveBeenCalledTimes(2));

    expect(spyPostMessage).toBeCalledWith({
      msg: "nnsStopTransactionsTimer",
    });
  });
});
