import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { initBalancesWorker } from "$lib/services/worker-balances.services";
import type { PostMessageDataRequestBalances } from "$lib/types/post-message.balances";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { ledgerCanisterIdMock } from "$tests/mocks/sns.api.mock";

describe("initBalancesWorker", () => {
  let spyPostMessage;

  beforeEach(() => {
    spyPostMessage = jest.fn();

    jest.mock("$lib/workers/balances.worker?worker", () => {
      return class BalancesWorker {
        postMessage(data: {
          msg: "nnsStartBalancesTimer";
          data: PostMessageDataRequestBalances;
        }) {
          spyPostMessage(data);
        }
      };
    });
  });

  it("should start worker with params", async () => {
    const worker = await initBalancesWorker();

    const callback = jest.fn();

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
});
