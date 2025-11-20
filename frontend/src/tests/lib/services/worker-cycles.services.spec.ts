import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { initCyclesWorker } from "$lib/services/worker-cycles.services";
import { mockCanisterId } from "$tests/mocks/canisters.mock";

vi.mock("$lib/workers/cycles.worker?worker");

describe("initCyclesWorker", () => {
  const postMessage = vi.fn();
  beforeEach(async () => {
    const module = await import("$lib/workers/cycles.worker?worker");
    // In Vitest 4, we need to mock default as a constructor (class)
    module.default = class {
      postMessage = postMessage;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  it("starting sends post message with host and fetchRootKey", async () => {
    const cyclesWorker = initCyclesWorker();

    const callback = vi.fn();

    (await cyclesWorker).startCyclesTimer({
      callback,
      canisterId: mockCanisterId.toText(),
    });

    expect(postMessage).toBeCalledWith({
      msg: "nnsStartCyclesTimer",
      data: {
        canisterId: mockCanisterId.toText(),
        host: HOST,
        fetchRootKey: FETCH_ROOT_KEY,
      },
    });
  });
});
