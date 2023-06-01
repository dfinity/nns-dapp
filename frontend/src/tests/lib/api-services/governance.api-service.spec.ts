import {
  governanceApiService,
  resetNeuronsApiService,
} from "$lib/api-services/governance.api-service";
import * as api from "$lib/api/governance.api";
import { mockMainAccount } from "$tests/mocks/accounts.store.mock";
import {
  createMockIdentity,
  mockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import {
  createMockKnownNeuron,
  createMockNeuron,
} from "$tests/mocks/neurons.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { Topic, Vote } from "@dfinity/nns";
import type { RewardEvent } from "@dfinity/nns/dist/candid/governance";

jest.mock("$lib/api/governance.api");

const neuron1 = createMockNeuron(1);
const neuron2 = createMockNeuron(2);
const neurons = [neuron1, neuron2];

const identity1 = createMockIdentity(1);
const identity2 = createMockIdentity(2);
const unknownIdentity = createMockIdentity(999);

const knownNeuron1 = createMockKnownNeuron(1001);

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
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  await apiServiceFunc(params);
  expect(apiFunc).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await governanceApiService.queryNeurons(qParams);
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
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  const servicePromise = apiServiceFunc(params);
  expect(apiFunc).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  // Once the API result resolves, the cache is cleared.
  resolveApi();
  await servicePromise;

  // Now the cache was invalidated.
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(2);

  // Getting results from the cache once again.
  await governanceApiService.queryNeurons(qParams);
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
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  const servicePromise = apiServiceFunc(params);
  expect(apiFunc).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(1);

  // Still getting results from the cache.
  await governanceApiService.queryNeurons(qParams);
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
  await governanceApiService.queryNeurons(qParams);
  expect(api.queryNeurons).toHaveBeenCalledTimes(2);

  // Getting results from the cache once again.
  await governanceApiService.queryNeurons(qParams);
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
        await governanceApiService.queryNeuron({
          neuronId: BigInt(1),
          ...params,
        })
      ).toEqual(neuron1);
      expect(
        await governanceApiService.queryNeuron({
          neuronId: BigInt(2),
          ...params,
        })
      ).toEqual(neuron2);
      expect(api.queryNeuron).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryNeuron api fails", async () => {
      expect(() =>
        governanceApiService.queryNeuron({ neuronId: BigInt(999), ...params })
      ).rejects.toThrow("No neuron with id 999");
      expect(api.queryNeuron).toHaveBeenCalledTimes(1);
    });

    it("should not invalidate the cache", async () => {
      await shouldNotInvalidateCache({
        apiFunc: api.queryNeuron,
        apiServiceFunc: governanceApiService.queryNeuron,
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
      expect(await governanceApiService.queryNeurons(params1)).toEqual([
        neuron1,
      ]);
      expect(await governanceApiService.queryNeurons(params2)).toEqual([
        neuron2,
      ]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryNeurons api fails", async () => {
      expect(() =>
        governanceApiService.queryNeurons({
          identity: unknownIdentity,
          ...params,
        })
      ).rejects.toThrow("Unknown identity");
    });

    it("should call queryNeurons api once for duplicate certified calls", async () => {
      const params = { identity: identity1, certified: true };
      // Calls API.
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
      // Uses cache.
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
    });

    it("should call queryNeurons api twice for simultaneous certified calls", async () => {
      const params = { identity: identity1, certified: true };
      const promise1 = governanceApiService.queryNeurons(params);
      // We didn't await the promise so nothing is cached yet when we make
      // the second call.
      const promise2 = governanceApiService.queryNeurons(params);
      expect(promise1).not.toBe(promise2);
      expect(await promise1).toEqual([neuron1]);
      expect(await promise2).toEqual([neuron1]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should call queryNeurons api twice for duplicate uncertified calls", async () => {
      const params = { identity: identity1, certified: false };
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      // We don't cache uncertified calls.
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should respond to an uncertified call from the cache", async () => {
      const params = { identity: identity1 };
      expect(
        await governanceApiService.queryNeurons({ ...params, certified: true })
      ).toEqual([neuron1]);
      expect(
        await governanceApiService.queryNeurons({ ...params, certified: false })
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

      expect(() => governanceApiService.queryNeurons(params)).rejects.toThrow(
        "500"
      );
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should expire its cache after 5 minutes", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2020-8-1 21:55:00"));

      const params = { identity: identity1, certified: true };
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      jest.setSystemTime(new Date("2020-8-1 21:59:59"));
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
      jest.setSystemTime(new Date("2020-8-1 22:00:01"));
      expect(await governanceApiService.queryNeurons(params)).toEqual([
        neuron1,
      ]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });
  });

  describe("queryKnownNeurons", () => {
    beforeEach(() => {
      jest.spyOn(api, "queryKnownNeurons").mockResolvedValue([knownNeuron1]);
    });

    const certifiedParams = { identity: identity1, certified: true };
    const uncertifiedParams = { identity: identity1, certified: false };

    it("should call queryKnownNeurons api", async () => {
      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
      expect(api.queryKnownNeurons).toHaveBeenCalledWith({
        identity: identity1,
        certified: true,
      });
    });

    it("should fail if queryKnownNeurons api fails", async () => {
      jest
        .spyOn(api, "queryKnownNeurons")
        .mockRejectedValueOnce(new Error("500"));

      expect(() =>
        governanceApiService.queryKnownNeurons(certifiedParams)
      ).rejects.toThrow("500");
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
    });

    it("should call queryKnownNeurons api once for duplicate certified calls", async () => {
      // Calls API.
      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
      // Uses cache.
      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
    });

    it("should call queryKnownNeurons api twice for simultaneous certified calls", async () => {
      const promise1 = governanceApiService.queryKnownNeurons(certifiedParams);
      // We didn't await the promise so nothing is cached yet when we make
      // the second call.
      const promise2 = governanceApiService.queryKnownNeurons(certifiedParams);
      expect(promise1).not.toBe(promise2);
      expect(await promise1).toEqual([knownNeuron1]);
      expect(await promise2).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(2);
    });

    it("should call queryKnownNeurons api twice for duplicate uncertified calls", async () => {
      expect(
        await governanceApiService.queryKnownNeurons(uncertifiedParams)
      ).toEqual([knownNeuron1]);
      expect(
        await governanceApiService.queryKnownNeurons(uncertifiedParams)
      ).toEqual([knownNeuron1]);
      // We don't cache uncertified calls.
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(2);
    });

    it("should respond to an uncertified call from the cache", async () => {
      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      expect(
        await governanceApiService.queryKnownNeurons(uncertifiedParams)
      ).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledWith(certifiedParams);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
    });

    it("should not cache error responses", async () => {
      jest
        .spyOn(api, "queryKnownNeurons")
        .mockRejectedValueOnce(new Error("500"));

      expect(() =>
        governanceApiService.queryKnownNeurons(certifiedParams)
      ).rejects.toThrow("500");
      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(2);
    });

    it("should expire its cache after 5 minutes", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2020-8-1 21:55:00"));

      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      jest.setSystemTime(new Date("2020-8-1 21:59:59"));
      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
      jest.setSystemTime(new Date("2020-8-1 22:00:01"));
      expect(
        await governanceApiService.queryKnownNeurons(certifiedParams)
      ).toEqual([knownNeuron1]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(2);
    });
  });

  describe("queryLastestRewardEvent", () => {
    const rewardEvent1: RewardEvent = mockRewardEvent;
    const rewardEvent2: RewardEvent = {
      ...rewardEvent1,
      rounds_since_last_distribution: [BigInt(2_000)],
    };
    beforeEach(() => {
      jest
        .spyOn(api, "queryLastestRewardEvent")
        .mockImplementation(async ({ identity }: api.ApiQueryParams) => {
          if (identity === identity1) {
            return rewardEvent1;
          }
          if (identity === identity2) {
            return rewardEvent2;
          }
          throw new Error(`Unknown identity: ${identity.getPrincipal()}`);
        });
    });

    const params = { certified: true };

    it("should call queryLastestRewardEvent api", async () => {
      const params1 = { identity: identity1, ...params };
      const params2 = { identity: identity2, ...params };
      expect(
        await governanceApiService.queryLastestRewardEvent(params1)
      ).toEqual(rewardEvent1);
      expect(
        await governanceApiService.queryLastestRewardEvent(params2)
      ).toEqual(rewardEvent2);
      expect(api.queryLastestRewardEvent).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryLastestRewardEvent api fails", async () => {
      expect(() =>
        governanceApiService.queryLastestRewardEvent({
          identity: unknownIdentity,
          ...params,
        })
      ).rejects.toThrow("Unknown identity");
      expect(api.queryLastestRewardEvent).toHaveBeenCalledTimes(1);
    });

    it("should not invalidate the cache", async () => {
      await shouldNotInvalidateCache({
        apiFunc: api.queryLastestRewardEvent,
        apiServiceFunc: governanceApiService.queryLastestRewardEvent,
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
      governanceApiService.addHotkey(params);
      expect(api.addHotkey).toHaveBeenCalledWith(params);
      expect(api.addHotkey).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.addHotkey,
        apiServiceFunc: governanceApiService.addHotkey,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.addHotkey,
        apiServiceFunc: governanceApiService.addHotkey,
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
      governanceApiService.autoStakeMaturity(params);
      expect(api.autoStakeMaturity).toHaveBeenCalledWith(params);
      expect(api.autoStakeMaturity).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.autoStakeMaturity,
        apiServiceFunc: governanceApiService.autoStakeMaturity,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.autoStakeMaturity,
        apiServiceFunc: governanceApiService.autoStakeMaturity,
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
      expect(await governanceApiService.claimOrRefreshNeuron(params)).toEqual(
        neuronId
      );
      expect(api.claimOrRefreshNeuron).toHaveBeenCalledWith(params);
      expect(api.claimOrRefreshNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.claimOrRefreshNeuron,
        apiServiceFunc: governanceApiService.claimOrRefreshNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.claimOrRefreshNeuron,
        apiServiceFunc: governanceApiService.claimOrRefreshNeuron,
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
      governanceApiService.disburse(params);
      expect(api.disburse).toHaveBeenCalledWith(params);
      expect(api.disburse).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.disburse,
        apiServiceFunc: governanceApiService.disburse,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.disburse,
        apiServiceFunc: governanceApiService.disburse,
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
      governanceApiService.increaseDissolveDelay(params);
      expect(api.increaseDissolveDelay).toHaveBeenCalledWith(params);
      expect(api.increaseDissolveDelay).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.increaseDissolveDelay,
        apiServiceFunc: governanceApiService.increaseDissolveDelay,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.increaseDissolveDelay,
        apiServiceFunc: governanceApiService.increaseDissolveDelay,
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
      governanceApiService.joinCommunityFund(params);
      expect(api.joinCommunityFund).toHaveBeenCalledWith(params);
      expect(api.joinCommunityFund).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.joinCommunityFund,
        apiServiceFunc: governanceApiService.joinCommunityFund,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.joinCommunityFund,
        apiServiceFunc: governanceApiService.joinCommunityFund,
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
      governanceApiService.leaveCommunityFund(params);
      expect(api.leaveCommunityFund).toHaveBeenCalledWith(params);
      expect(api.leaveCommunityFund).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.leaveCommunityFund,
        apiServiceFunc: governanceApiService.leaveCommunityFund,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.leaveCommunityFund,
        apiServiceFunc: governanceApiService.leaveCommunityFund,
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
      governanceApiService.mergeMaturity(params);
      expect(api.mergeMaturity).toHaveBeenCalledWith(params);
      expect(api.mergeMaturity).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.mergeMaturity,
        apiServiceFunc: governanceApiService.mergeMaturity,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.mergeMaturity,
        apiServiceFunc: governanceApiService.mergeMaturity,
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
      governanceApiService.mergeNeurons(params);
      expect(api.mergeNeurons).toHaveBeenCalledWith(params);
      expect(api.mergeNeurons).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.mergeNeurons,
        apiServiceFunc: governanceApiService.mergeNeurons,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.mergeNeurons,
        apiServiceFunc: governanceApiService.mergeNeurons,
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
      governanceApiService.removeHotkey(params);
      expect(api.removeHotkey).toHaveBeenCalledWith(params);
      expect(api.removeHotkey).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.removeHotkey,
        apiServiceFunc: governanceApiService.removeHotkey,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.removeHotkey,
        apiServiceFunc: governanceApiService.removeHotkey,
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
      governanceApiService.setFollowees(params);
      expect(api.setFollowees).toHaveBeenCalledWith(params);
      expect(api.setFollowees).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.setFollowees,
        apiServiceFunc: governanceApiService.setFollowees,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.setFollowees,
        apiServiceFunc: governanceApiService.setFollowees,
        params,
      });
    });
  });

  describe("simulateMergeNeurons", () => {
    const params = {
      identity: mockIdentity,
      sourceNeuronId: BigInt(3),
      targetNeuronId: BigInt(21),
    };

    it("should call simulmateMergeNeurons api", () => {
      governanceApiService.simulateMergeNeurons(params);
      expect(api.simulateMergeNeurons).toHaveBeenCalledWith(params);
      expect(api.simulateMergeNeurons).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.simulateMergeNeurons,
        apiServiceFunc: governanceApiService.simulateMergeNeurons,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.simulateMergeNeurons,
        apiServiceFunc: governanceApiService.simulateMergeNeurons,
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
      expect(await governanceApiService.spawnNeuron(params)).toEqual(neuronId);
      expect(api.spawnNeuron).toHaveBeenCalledWith(params);
      expect(api.spawnNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.spawnNeuron,
        apiServiceFunc: governanceApiService.spawnNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.spawnNeuron,
        apiServiceFunc: governanceApiService.spawnNeuron,
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
      expect(await governanceApiService.splitNeuron(params)).toEqual(neuronId);
      expect(api.splitNeuron).toHaveBeenCalledWith(params);
      expect(api.splitNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.splitNeuron,
        apiServiceFunc: governanceApiService.splitNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.splitNeuron,
        apiServiceFunc: governanceApiService.splitNeuron,
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
      governanceApiService.stakeMaturity(params);
      expect(api.stakeMaturity).toHaveBeenCalledWith(params);
      expect(api.stakeMaturity).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.stakeMaturity,
        apiServiceFunc: governanceApiService.stakeMaturity,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.stakeMaturity,
        apiServiceFunc: governanceApiService.stakeMaturity,
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
      expect(await governanceApiService.stakeNeuron(params)).toEqual(neuronId);
      expect(api.stakeNeuron).toHaveBeenCalledWith(params);
      expect(api.stakeNeuron).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.stakeNeuron,
        apiServiceFunc: governanceApiService.stakeNeuron,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.stakeNeuron,
        apiServiceFunc: governanceApiService.stakeNeuron,
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
      governanceApiService.startDissolving(params);
      expect(api.startDissolving).toHaveBeenCalledWith(params);
      expect(api.startDissolving).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.startDissolving,
        apiServiceFunc: governanceApiService.startDissolving,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.startDissolving,
        apiServiceFunc: governanceApiService.startDissolving,
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
      governanceApiService.stopDissolving(params);
      expect(api.stopDissolving).toHaveBeenCalledWith(params);
      expect(api.stopDissolving).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.stopDissolving,
        apiServiceFunc: governanceApiService.stopDissolving,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.stopDissolving,
        apiServiceFunc: governanceApiService.stopDissolving,
        params,
      });
    });
  });

  describe("registerVote", () => {
    const params = {
      neuronId,
      identity: mockIdentity,
      proposalId: mockProposalInfo.id,
      vote: Vote.Yes,
    };

    it("should call registerVote api", () => {
      governanceApiService.registerVote(params);
      expect(api.registerVote).toHaveBeenCalledWith(params);
      expect(api.registerVote).toHaveBeenCalledTimes(1);
    });

    it("should invalidate the cache", async () => {
      await shouldInvalidateCache({
        apiFunc: api.registerVote,
        apiServiceFunc: governanceApiService.registerVote,
        params,
      });
    });

    it("should invalidate the cache on failure", async () => {
      await shouldInvalidateCacheOnFailure({
        apiFunc: api.registerVote,
        apiServiceFunc: governanceApiService.registerVote,
        params,
      });
    });
  });
});
