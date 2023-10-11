import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { initBalancesWorker } from "$lib/services/worker-balances.services";
import type {
  PostMessageDataRequestBalances,
  PostMessageDataResponseBalances,
} from "$lib/types/post-message.balances";
import type { PostMessageDataResponseSync } from "$lib/types/post-message.sync";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { ledgerCanisterIdMock } from "$tests/mocks/sns.api.mock";
import {waitFor} from "@testing-library/svelte";

describe("initBalancesWorker", () => {
  let spyPostMessage;
  let workerOnMessage;

  beforeEach(() => {
    workerOnMessage = undefined;
    spyPostMessage = vi.fn();

    vi.doMock("$lib/workers/balances.worker?worker", () => ({
      default: class BalancesWorker {
        postMessage(data: {
          msg: "nnsStartBalancesTimer";
          data: PostMessageDataRequestBalances;
        }) {
          spyPostMessage(data);
        }

        set onmessage(
            callback: (
                event: MessageEvent<
                    PostMessageDataResponseBalances | PostMessageDataResponseSync
                >
            ) => void
        ) {
          workerOnMessage = callback;
        }
      }
    }));
  });

  it("should start worker with params", async () => {
    const worker = await initBalancesWorker();

    const callback = vi.fn();

    const params = {
      ledgerCanisterId: ledgerCanisterIdMock.toText(),
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    worker.startBalancesTimer({
      ...params,
      callback,
    });

    expect(spyPostMessage).toBeCalledWith({
      msg: "nnsStartBalancesTimer",
      data: {
        ...params,
        host: HOST,
        fetchRootKey: FETCH_ROOT_KEY,
      },
    });
  });

  it("should call callback on nnsSyncBalances message", async () => {
    expect(workerOnMessage).toBeUndefined();

    const worker = await initBalancesWorker();

    expect(workerOnMessage).toBeDefined();

    const callback = vi.fn();

    const params = {
      ledgerCanisterId: ledgerCanisterIdMock.toText(),
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    worker.startBalancesTimer({
      ...params,
      callback,
    });

    expect(callback).not.toBeCalled();

    const callbackData = {
      balances: [
        {
          accountIdentifier: "account_identifier",
          amount: 123_000_000n,
        },
      ],
    };

    await workerOnMessage?.({
      data: {
        msg: "nnsSyncBalances",
        data: callbackData,
      },
    });

    expect(callback).toBeCalledWith(callbackData);
    expect(callback).toBeCalledTimes(1);
  });

  it("should stop worker", async () => {
    const worker = await initBalancesWorker();

    worker.stopBalancesTimer();

    expect(spyPostMessage).toBeCalledWith({
      msg: "nnsStopBalancesTimer",
    });
  });

  it("should not call callback after worker is stopped", async () => {
    expect(workerOnMessage).toBeUndefined();

    const worker = await initBalancesWorker();

    expect(workerOnMessage).toBeDefined();

    const callback = vi.fn();

    const params = {
      ledgerCanisterId: ledgerCanisterIdMock.toText(),
      accountIdentifiers: [mockSnsMainAccount.identifier],
    };

    worker.startBalancesTimer({
      ...params,
      callback,
    });

    expect(callback).not.toBeCalled();

    worker.stopBalancesTimer();

    const callbackData = {
      balances: [
        {
          accountIdentifier: "account_identifier",
          amount: 123_000_000n,
        },
      ],
    };

    await workerOnMessage?.({
      data: {
        msg: "nnsSyncBalances",
        data: callbackData,
      },
    });

    expect(callback).not.toBeCalled();
  });
});
