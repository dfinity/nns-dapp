import {
  neuronsApiService,
  resetNeuronsApiService,
} from "$lib/api-services/neurons.api-service";
import * as api from "$lib/api/governance.api";
import { Topic } from "@dfinity/nns";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import {
  createMockIdentity,
  mockIdentity,
  mockPrincipal,
} from "../../mocks/auth.store.mock";
import {
  createMockKnownNeuron,
  createMockNeuron,
} from "../../mocks/neurons.mock";

jest.mock("$lib/api/governance.api");

const neuron1 = createMockNeuron(1);
const neuron2 = createMockNeuron(2);
const neurons = [neuron1, neuron2];

const identity1 = createMockIdentity(1);
const identity2 = createMockIdentity(2);
const unknownIdentity = createMockIdentity(999);

const knownNeuron1 = createMockKnownNeuron(1001);
const knownNeuron2 = createMockKnownNeuron(1002);

const shouldNotInvalidateCache = async <P, R>({
  apiFunc,
  apiServiceFunc,
  params,
}: {
  apiFunc: (params: P) => Promise<R>;
  apiServiceFunc: (params: P) => Promise<R>;
  params: P;
}) => {
  jest.spyOn(api, "queryNeurons").mockResolvedValue(neurons);

  const qParams = { identity: identity1, certified: true };
  expect(api.queryNeurons).toHaveBeenCalledTimes(0);
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  await apiServiceFunc(params);
  expect(apiFunc).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);
};

const shouldInvalidateCache = async <P, R>({
  apiFunc,
  apiServiceFunc,
  params,
}: {
  apiFunc: (params: P) => Promise<R>;
  apiServiceFunc: (params: P) => Promise<R>;
  params: P;
}) => {
  let resolveApi: () => void;
  const apiPromise = new Promise<void>((resolve) => {
    resolveApi = resolve;
  });
  (apiFunc as jest.Mock).mockReturnValue(apiPromise);
  jest.spyOn(api, "queryNeurons").mockResolvedValue(neurons);

  const qParams = { identity: identity1, certified: true };
  expect(api.queryNeurons).toHaveBeenCalledTimes(0);
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  const servicePromise = apiServiceFunc(params);
  expect(apiFunc).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  // Once the API result resolves, the cache is cleared.
  resolveApi();
  await servicePromise;

  // Now the cache was invalidated.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(2);

  // Getting results from the cache once again.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(2);
};

const shouldInvalidateCacheOnFailure = async <P, R>({
  apiFunc,
  apiServiceFunc,
  params,
}: {
  apiFunc: (params: P) => Promise<R>;
  apiServiceFunc: (params: P) => Promise<R>;
  params: P;
}) => {
  let rejectApi: (error: Error) => void;
  const apiPromise = new Promise<void>((_, reject) => {
    rejectApi = reject;
  });
  (apiFunc as jest.Mock).mockReturnValue(apiPromise);
  jest.spyOn(api, "queryNeurons").mockResolvedValue(neurons);

  const qParams = { identity: identity1, certified: true };
  expect(api.queryNeurons).toHaveBeenCalledTimes(0);
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  const servicePromise = apiServiceFunc(params);
  expect(apiFunc).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  // Once the API call fails, the cache is cleared.
  const apiErrorMessage = "Api call failed";
  rejectApi(new Error(apiErrorMessage));

  try {
    await servicePromise;
    fail("The call should have failed.");
  } catch (error) {
    expect(error.message).toEqual(apiErrorMessage);
  }

  // Now the cache was invalidated.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(2);

  // Getting results from the cache once again.
  await neuronsApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(2);
};

describe("neurons api-service", () => {
  const neuronId = BigInt(12);

  beforeEach(() => {
    jest.clearAllMocks();
    resetNeuronsApiService();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // Read calls

  describe("queryNeuron", () => {
    beforeEach(() => {
      jest
        .spyOn(api, "queryNeuron")
        .mockImplementation(async ({ neuronId }: api.ApiQueryNeuronParams) => {
          const neuron = neurons.find((n) => n.neuronId === neuronId);
          if (!neuron) {
            throw new Error(`No neuron with id ${neuronId}`);
          }
          return neuron;
        });
    });

    const params = { identity: mockIdentity, certified: true };

    it("should call queryNeuron api", async () => {
      expect(
        await neuronsApiService.queryNeuron({ neuronId: BigInt(1), ...params })
      ).toEqual(neuron1);
      expect(
        await neuronsApiService.queryNeuron({ neuronId: BigInt(2), ...params })
      ).toEqual(neuron2);
      expect(api.queryNeuron).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryNeuron api fails", async () => {
      expect(() =>
        neuronsApiService.queryNeuron({ neuronId: BigInt(999), ...params })
      ).rejects.toThrow("No neuron with id 999");
      expect(api.queryNeuron).toHaveBeenCalledTimes(1);
    });

    it("should not invalidate the cache", async () => {
      await shouldNotInvalidateCache({
        apiFunc: api.queryNeuron,
        apiServiceFunc: neuronsApiService.queryNeuron,
        params: { neuronId: BigInt(1), ...params },
      });
    });
  });

  describe("queryNeurons", () => {
    beforeEach(() => {
      jest
        .spyOn(api, "queryNeurons")
        .mockImplementation(async ({ identity }: api.ApiQueryParams) => {
          if (identity === identity1) {
            return [neuron1];
          }
          if (identity === identity2) {
            return [neuron2];
          }
          throw new Error(`Unknown identity: ${identity.getPrincipal()}`);
        });
    });

    const params = { certified: true };

    it("should call queryNeurons api", async () => {
      const params1 = { identity: identity1, ...params };
      const params2 = { identity: identity2, ...params };
      expect(await neuronsApiService.queryNeurons(params1)).toEqual([neuron1]);
      expect(await neuronsApiService.queryNeurons(params2)).toEqual([neuron2]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryNeurons api fails", async () => {
      expect(() =>
        neuronsApiService.queryNeurons({ identity: unknownIdentity, ...params })
      ).rejects.toThrow("Unknown identity");
    });

    it("should call queryNeurons api once for duplicate certified calls", async () => {
      const params = { identity: identity1, certified: true };
      // Calls API.
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
      // Uses cache.
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
    });

    it("should call queryNeurons api twice for simultaneous certified calls", async () => {
      const params = { identity: identity1, certified: true };
      const promise1 = neuronsApiService.queryNeurons(params);
      // We didn't await the promise so nothing is cached yet when we make
      // the second call.
      const promise2 = neuronsApiService.queryNeurons(params);
      expect(promise1).not.toBe(promise2);
      expect(await promise1).toEqual([neuron1]);
      expect(await promise2).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should call queryNeurons api twice for duplicate uncertified calls", async () => {
      const params = { identity: identity1, certified: false };
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      // We don't cache uncertified calls.
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should respond to an uncertified call from the cache", async () => {
      const params = { identity: identity1 };
      expect(
        await neuronsApiService.queryNeurons({ ...params, certified: true })
      ).toEqual([neuron1]);
      expect(
        await neuronsApiService.queryNeurons({ ...params, certified: false })
      ).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledWith({
        ...params,
        certified: true,
      });
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
    });

    it("should not cache error responses", async () => {
      const params = { identity: identity1, certified: true };
      jest.spyOn(api, "queryNeurons").mockRejectedValueOnce(new Error("500"));

      expect(() => neuronsApiService.queryNeurons(params)).rejects.toThrow(
        "500"
      );
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should expire its cache after 5 minutes", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2020-8-1 21:55:00"));

      const params = { identity: identity1, certified: true };
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      jest.setSystemTime(new Date("2020-8-1 21:59:59"));
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
      jest.setSystemTime(new Date("2020-8-1 22:00:01"));
      expect(await neuronsApiService.queryNeurons(params)).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });
  });

  describe("queryKnownNeurons", () => {
    beforeEach(() => {
      jest
        .spyOn(api, "queryKnownNeurons")
        .mockImplementation(async ({ identity }: api.ApiQueryParams) => {
          if (identity === identity1) {
            return [knownNeuron1];
          }
          if (identity === identity2) {
            return [knownNeuron2];
          }
          throw new Error(`Unknown identity: ${identity.getPrincipal()}`);
        });
    });

    const params = { certified: true };

    it("should call queryKnownNeurons api", async () => {
      const params1 = { identity: identity1, ...params };
      const params2 = { identity: identity2, ...params };
      expect(await neuronsApiService.queryKnownNeurons(params1)).toEqual([
        knownNeuron1,
      ]);
      expect(await neuronsApiService.queryKnownNeurons(params2)).toEqual([
        knownNeuron2,
      ]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryKnownNeurons api fails", async () => {
      expect(() =>
        neuronsApiService.queryKnownNeurons({
          identity: unknownIdentity,
          ...params,
        })
      ).rejects.toThrow("Unknown identity");
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
    });

    it("should not invalidate the cache", async () => {
      await shouldNotInvalidateCache({
        apiFunc: api.queryKnownNeurons,
        apiServiceFunc: neuronsApiService.queryKnownNeurons,
        params: { identity: identity1, ...params },
      });
    });
  });

  // Action calls

  describe("addHotkey", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      principal: mockPrincipal,
    };

    it("should call addHotkey api", () => {
      neuronsApiService.addHotkey(params);
      expect(api.addHotkey).toHaveBeenCalledWith(params);
      expect(api.addHotkey).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.addHotkey,
        apiServiceFunc: neuronsApiService.addHotkey,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.addHotkey,
        apiServiceFunc: neuronsApiService.addHotkey,
        params,
      });
    });
  });

  describe("autoStakeMaturity", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      autoStake: true,
    };

    it("should call autoStakeMaturity api", () => {
      neuronsApiService.autoStakeMaturity(params);
      expect(api.autoStakeMaturity).toHaveBeenCalledWith(params);
      expect(api.autoStakeMaturity).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.autoStakeMaturity,
        apiServiceFunc: neuronsApiService.autoStakeMaturity,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.autoStakeMaturity,
        apiServiceFunc: neuronsApiService.autoStakeMaturity,
        params,
      });
    });
  });

  describe("claimOrRefreshNeuron", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
    };

    it("should call claimOrRefreshNeuron api", async () => {
      jest.spyOn(api, "claimOrRefreshNeuron").mockResolvedValueOnce(neuronId);
      expect(await neuronsApiService.claimOrRefreshNeuron(params)).toEqual(
        neuronId
      );
      expect(api.claimOrRefreshNeuron).toHaveBeenCalledWith(params);
      expect(api.claimOrRefreshNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.claimOrRefreshNeuron,
        apiServiceFunc: neuronsApiService.claimOrRefreshNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.claimOrRefreshNeuron,
        apiServiceFunc: neuronsApiService.claimOrRefreshNeuron,
        params,
      });
    });
  });

  describe("disburse", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      toAccount: mockMainAccount.identifier,
      amount: BigInt(10_000_000),
    };

    it("should call disburse api", () => {
      neuronsApiService.disburse(params);
      expect(api.disburse).toHaveBeenCalledWith(params);
      expect(api.disburse).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.disburse,
        apiServiceFunc: neuronsApiService.disburse,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.disburse,
        apiServiceFunc: neuronsApiService.disburse,
        params,
      });
    });
  });

  describe("increaseDissolveDelay", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      dissolveDelayInSeconds: 2,
    };

    it("should call increaseDissolveDelay api", () => {
      neuronsApiService.increaseDissolveDelay(params);
      expect(api.increaseDissolveDelay).toHaveBeenCalledWith(params);
      expect(api.increaseDissolveDelay).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.increaseDissolveDelay,
        apiServiceFunc: neuronsApiService.increaseDissolveDelay,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.increaseDissolveDelay,
        apiServiceFunc: neuronsApiService.increaseDissolveDelay,
        params,
      });
    });
  });

  describe("joinCommunityFund", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
    };

    it("should call joinCommunityFund api", () => {
      neuronsApiService.joinCommunityFund(params);
      expect(api.joinCommunityFund).toHaveBeenCalledWith(params);
      expect(api.joinCommunityFund).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.joinCommunityFund,
        apiServiceFunc: neuronsApiService.joinCommunityFund,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.joinCommunityFund,
        apiServiceFunc: neuronsApiService.joinCommunityFund,
        params,
      });
    });
  });

  describe("leaveCommunityFund", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
    };

    it("should call leaveCommunityFund api", () => {
      neuronsApiService.leaveCommunityFund(params);
      expect(api.leaveCommunityFund).toHaveBeenCalledWith(params);
      expect(api.leaveCommunityFund).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.leaveCommunityFund,
        apiServiceFunc: neuronsApiService.leaveCommunityFund,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.leaveCommunityFund,
        apiServiceFunc: neuronsApiService.leaveCommunityFund,
        params,
      });
    });
  });

  describe("mergeMaturity", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      percentageToMerge: 0.2,
    };

    it("should call mergeMaturity api", () => {
      neuronsApiService.mergeMaturity(params);
      expect(api.mergeMaturity).toHaveBeenCalledWith(params);
      expect(api.mergeMaturity).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.mergeMaturity,
        apiServiceFunc: neuronsApiService.mergeMaturity,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.mergeMaturity,
        apiServiceFunc: neuronsApiService.mergeMaturity,
        params,
      });
    });
  });

  describe("mergeNeurons", () => {
    const params = {
      identity: mockIdentity,
      sourceNeuronId: BigInt(2),
      targetNeuronId: BigInt(20),
    };

    it("should call mergeNeurons api", () => {
      neuronsApiService.mergeNeurons(params);
      expect(api.mergeNeurons).toHaveBeenCalledWith(params);
      expect(api.mergeNeurons).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.mergeNeurons,
        apiServiceFunc: neuronsApiService.mergeNeurons,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.mergeNeurons,
        apiServiceFunc: neuronsApiService.mergeNeurons,
        params,
      });
    });
  });

  describe("removeHotkey", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      principal: mockPrincipal,
    };

    it("should call removeHotkey api", () => {
      neuronsApiService.removeHotkey(params);
      expect(api.removeHotkey).toHaveBeenCalledWith(params);
      expect(api.removeHotkey).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.removeHotkey,
        apiServiceFunc: neuronsApiService.removeHotkey,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.removeHotkey,
        apiServiceFunc: neuronsApiService.removeHotkey,
        params,
      });
    });
  });

  describe("setFollowees", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      topic: Topic.ExchangeRate,
      followees: [BigInt(2), BigInt(20)],
    };

    it("should call setFollowees api", () => {
      neuronsApiService.setFollowees(params);
      expect(api.setFollowees).toHaveBeenCalledWith(params);
      expect(api.setFollowees).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.setFollowees,
        apiServiceFunc: neuronsApiService.setFollowees,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.setFollowees,
        apiServiceFunc: neuronsApiService.setFollowees,
        params,
      });
    });
  });

  describe("spawnNeuron", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
    };

    it("should call spawnNeuron api", async () => {
      jest.spyOn(api, "spawnNeuron").mockResolvedValueOnce(neuronId);
      expect(await neuronsApiService.spawnNeuron(params)).toEqual(neuronId);
      expect(api.spawnNeuron).toHaveBeenCalledWith(params);
      expect(api.spawnNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.spawnNeuron,
        apiServiceFunc: neuronsApiService.spawnNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.spawnNeuron,
        apiServiceFunc: neuronsApiService.spawnNeuron,
        params,
      });
    });
  });

  describe("splitNeuron", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      amount: BigInt(10_000_000),
    };

    it("should call splitNeuron api", async () => {
      jest.spyOn(api, "splitNeuron").mockResolvedValueOnce(neuronId);
      expect(await neuronsApiService.splitNeuron(params)).toEqual(neuronId);
      expect(api.splitNeuron).toHaveBeenCalledWith(params);
      expect(api.splitNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.splitNeuron,
        apiServiceFunc: neuronsApiService.splitNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.splitNeuron,
        apiServiceFunc: neuronsApiService.splitNeuron,
        params,
      });
    });
  });

  describe("stakeMaturity", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      percentageToStake: 0.2,
    };

    it("should call stakeMaturity api", () => {
      neuronsApiService.stakeMaturity(params);
      expect(api.stakeMaturity).toHaveBeenCalledWith(params);
      expect(api.stakeMaturity).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.stakeMaturity,
        apiServiceFunc: neuronsApiService.stakeMaturity,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.stakeMaturity,
        apiServiceFunc: neuronsApiService.stakeMaturity,
        params,
      });
    });
  });

  describe("stakeNeuron", () => {
    const params = {
      identity: mockIdentity,
      stake: BigInt(10_000_000),
      controller: mockPrincipal,
      ledgerCanisterIdentity: mockIdentity,
      fromSubaccount: new Uint8Array(),
    };

    it("should call stakeNeuron api", async () => {
      jest.spyOn(api, "stakeNeuron").mockResolvedValueOnce(neuronId);
      expect(await neuronsApiService.stakeNeuron(params)).toEqual(neuronId);
      expect(api.stakeNeuron).toHaveBeenCalledWith(params);
      expect(api.stakeNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.stakeNeuron,
        apiServiceFunc: neuronsApiService.stakeNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.stakeNeuron,
        apiServiceFunc: neuronsApiService.stakeNeuron,
        params,
      });
    });
  });

  describe("startDissolving", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
    };

    it("should call startDissolving api", () => {
      neuronsApiService.startDissolving(params);
      expect(api.startDissolving).toHaveBeenCalledWith(params);
      expect(api.startDissolving).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.startDissolving,
        apiServiceFunc: neuronsApiService.startDissolving,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.startDissolving,
        apiServiceFunc: neuronsApiService.startDissolving,
        params,
      });
    });
  });

  describe("stopDissolving", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
    };

    it("should call stopDissolving api", () => {
      neuronsApiService.stopDissolving(params);
      expect(api.stopDissolving).toHaveBeenCalledWith(params);
      expect(api.stopDissolving).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.stopDissolving,
        apiServiceFunc: neuronsApiService.stopDissolving,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.stopDissolving,
        apiServiceFunc: neuronsApiService.stopDissolving,
        params,
      });
    });
  });
});
