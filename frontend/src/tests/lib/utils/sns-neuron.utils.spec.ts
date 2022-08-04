import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { SECONDS_IN_YEAR } from "../../../lib/constants/constants";
import {
  getSnsDissolvingTimeInSeconds,
  getSnsLockedTimeInSeconds,
  getSnsNeuronByHexId,
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
  getSnsNeuronState,
  routePathSnsNeuronId,
  routePathSnsNeuronRootCanisterId,
  sortSnsNeuronsByCreatedTimestamp,
} from "../../../lib/utils/sns-neuron.utils";
import { bytesToHexString } from "../../../lib/utils/utils";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "../../mocks/sns-neurons.mock";

describe("sns-neuron utils", () => {
  describe("sortNeuronsByCreatedTimestamp", () => {
    it("should sort neurons by created_timestamp_seconds", () => {
      const neuron1 = {
        ...mockSnsNeuron,
        created_timestamp_seconds: BigInt(1),
      };
      const neuron2 = {
        ...mockSnsNeuron,
        created_timestamp_seconds: BigInt(2),
      };
      const neuron3 = {
        ...mockSnsNeuron,
        created_timestamp_seconds: BigInt(3),
      };
      expect(sortSnsNeuronsByCreatedTimestamp([])).toEqual([]);
      expect(sortSnsNeuronsByCreatedTimestamp([neuron1])).toEqual([neuron1]);
      expect(
        sortSnsNeuronsByCreatedTimestamp([neuron3, neuron2, neuron1])
      ).toEqual([neuron3, neuron2, neuron1]);
      expect(
        sortSnsNeuronsByCreatedTimestamp([neuron2, neuron1, neuron3])
      ).toEqual([neuron3, neuron2, neuron1]);
    });
  });

  describe("getSnsNeuronState", () => {
    it("returns LOCKED", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.LOCKED,
      });
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.LOCKED);
    });

    it("returns DISSOLVING", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.DISSOLVING,
      });
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.DISSOLVING);
    });

    it("returns DISSOLVED", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: undefined,
      });
      expect(getSnsNeuronState(neuron)).toEqual(NeuronState.DISSOLVED);
    });
  });

  describe("getSnsDissolvingTimeInSeconds", () => {
    it("returns undefined if not dissolving", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.LOCKED,
      });
      expect(getSnsDissolvingTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns time in seconds until dissolve", () => {
      const todayInSeconds = BigInt(Math.round(Date.now() / 1000));
      const delayInSeconds = todayInSeconds + BigInt(SECONDS_IN_YEAR);
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        dissolve_state: [{ WhenDissolvedTimestampSeconds: delayInSeconds }],
      };
      expect(getSnsDissolvingTimeInSeconds(neuron)).toBe(
        BigInt(SECONDS_IN_YEAR)
      );
    });
  });

  describe("getSnsLockedTimeInSeconds", () => {
    it("returns undefined if not locked", () => {
      const neuron = createMockSnsNeuron({
        id: [1, 2, 3, 4],
        state: NeuronState.DISSOLVING,
      });
      expect(getSnsLockedTimeInSeconds(neuron)).toBeUndefined();
    });

    it("returns time in seconds until dissolve", () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        dissolve_state: [{ DissolveDelaySeconds: BigInt(SECONDS_IN_YEAR) }],
      };
      expect(getSnsLockedTimeInSeconds(neuron)).toBe(BigInt(SECONDS_IN_YEAR));
    });
  });

  describe("getSnsNeuronStake", () => {
    it("returns stake minus neuron fees", () => {
      const stake1 = BigInt(100);
      const stake2 = BigInt(200);
      const fees1 = BigInt(10);
      const fees2 = BigInt(0);
      const neuron1: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: stake1,
        neuron_fees_e8s: fees1,
      };
      const neuron2: SnsNeuron = {
        ...mockSnsNeuron,
        cached_neuron_stake_e8s: stake2,
        neuron_fees_e8s: fees2,
      };
      expect(getSnsNeuronStake(neuron1)).toBe(stake1 - fees1);
      expect(getSnsNeuronStake(neuron2)).toBe(stake2 - fees2);
    });
  });

  describe("getSnsNeuronIdAsHexString", () => {
    it("returns id numbers concatenated", () => {
      const id = [
        154, 174, 251, 49, 236, 17, 214, 189, 195, 140, 58, 89, 61, 29, 138,
        113, 79, 48, 136, 37, 96, 61, 215, 50, 182, 65, 198, 97, 8, 19, 238, 36,
      ];
      const neuron: SnsNeuron = createMockSnsNeuron({
        id,
      });
      expect(getSnsNeuronIdAsHexString(neuron)).toBe(
        "9aaefb31ec11d6bdc38c3a593d1d8a714f308825603dd732b641c6610813ee24"
      );
    });
  });

  describe("getSnsNeuronByHexId", () => {
    it("returns the neuron with the matching id", () => {
      const neuronId = [1, 2, 3, 4];
      const neuron1 = createMockSnsNeuron({
        id: neuronId,
      });
      const neuron2 = createMockSnsNeuron({
        id: [5, 6, 7, 8],
      });
      const neurons = [neuron1, neuron2];
      expect(
        getSnsNeuronByHexId({
          neurons,
          neuronIdHex: bytesToHexString(neuronId),
        })
      ).toBe(neuron1);
    });

    it("returns undefined when no matching id", () => {
      const neuron1 = createMockSnsNeuron({
        id: [1, 2, 3, 4],
      });
      const neuron2 = createMockSnsNeuron({
        id: [5, 6, 7, 8],
      });
      const neurons = [neuron1, neuron2];
      expect(
        getSnsNeuronByHexId({
          neurons,
          neuronIdHex: bytesToHexString([1, 1, 1, 1]),
        })
      ).toBeUndefined();
    });

    it("returns undefined when no neurons", () => {
      expect(
        getSnsNeuronByHexId({
          neurons: [],
          neuronIdHex: bytesToHexString([1, 1, 1, 1]),
        })
      ).toBeUndefined();
      expect(
        getSnsNeuronByHexId({
          neurons: undefined,
          neuronIdHex: bytesToHexString([1, 1, 1, 1]),
        })
      ).toBeUndefined();
    });
  });

  describe("routePathSnsNeuronId", () => {
    afterAll(() => jest.clearAllMocks());
    it("should get neuronId from valid path", async () => {
      expect(routePathSnsNeuronId("/#/project/222/neuron/123")).toBe("123");
      expect(routePathSnsNeuronId("/#/project/222/neuron/0")).toBe("0");
    });

    it("should not get neuronId from invalid path", async () => {
      expect(routePathSnsNeuronId("/#/neuron/")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/project/123")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/project/124/neuron")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/neurons/")).toBeUndefined();
      expect(routePathSnsNeuronId("/#/accounts/")).toBeUndefined();
    });
  });

  describe("routePathSnsNeuronRootCanisterId", () => {
    afterAll(() => jest.clearAllMocks());
    it("should get root canister id from valid path", async () => {
      expect(
        routePathSnsNeuronRootCanisterId("/#/project/222/neuron/123")
      ).toBe("222");
      expect(routePathSnsNeuronRootCanisterId("/#/project/0ff/neuron/0")).toBe(
        "0ff"
      );
    });

    it("should not get root canister id from invalid path", async () => {
      expect(routePathSnsNeuronRootCanisterId("/#/neuron/")).toBeUndefined();
      expect(
        routePathSnsNeuronRootCanisterId("/#/project/123")
      ).toBeUndefined();
      expect(
        routePathSnsNeuronRootCanisterId("/#/project/124/neuron")
      ).toBeUndefined();
      expect(routePathSnsNeuronRootCanisterId("/#/neurons/")).toBeUndefined();
      expect(routePathSnsNeuronRootCanisterId("/#/accounts/")).toBeUndefined();
    });
  });
});
