import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { initTransactionsWorker } from "$lib/services/worker-transactions.services";
import type { PostMessageDataRequestTransactions } from "$lib/types/post-message.transactions";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { indexCanisterIdMock } from "$tests/mocks/sns.api.mock";

describe("initTransactionsWorker", () => {
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

  it("should start worker with params", async () => {
    const worker = await initTransactionsWorker();

    const callback = vi.fn();

    const params = {
      indexCanisterId: indexCanisterIdMock.toText(),
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    worker.startTransactionsTimer({
      ...params,
      callback,
    });

    expect(spyPostMessage).toBeCalledWith({
      msg: "nnsStartTransactionsTimer",
      data: {
        ...params,
        host: HOST,
        fetchRootKey: FETCH_ROOT_KEY,
      },
    });
  });

  it("should stop worker", async () => {
    const worker = await initTransactionsWorker();

    worker.stopTransactionsTimer();

    expect(spyPostMessage).toBeCalledWith({
      msg: "nnsStopTransactionsTimer",
    });
  });
});
