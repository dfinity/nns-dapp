import TransactionsObserver from "$lib/components/accounts/TransactionsObserver.svelte";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import type { TransactionsObserverData } from "$lib/types/icrc.observer";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { indexCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { render, waitFor } from "@testing-library/svelte";

let spyPostMessage;

vi.mock("$lib/workers/transactions.worker?worker", () => ({
  default: class TransactionsWorker {
    postMessage(data: {
      msg: "nnsStartTransactionsTimer";
      data: PostMessageDataRequestTransactions;
    }) {
      spyPostMessage(data);
    }
  },
}));

describe("TransactionsObserver", () => {
  beforeEach(() => {
    spyPostMessage = vi.fn();
  });

  const data: TransactionsObserverData = {
    indexCanisterId: indexCanisterIdMock.toText(),
    account: mockMainAccount,
  };

  it("should init worker with parameters", async () => {
    render(TransactionsObserver, {
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
    const { unmount } = render(TransactionsObserver, {
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
