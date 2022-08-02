import { NeuronState } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { SECONDS_IN_YEAR } from "../../../lib/constants/constants";
import {
  getSnsDissolvingTimeInSeconds,
  getSnsLockedTimeInSeconds,
  getSnsNeuronId,
  getSnsNeuronStake,
  getSnsNeuronState,
  sortSnsNeuronsByCreatedTimestamp,
} from "../../../lib/utils/sns-neuron.utils";
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
      const todayInSeconds = BigInt(Math.round(Date.now() / 1000));
      const delayInSeconds = todayInSeconds + BigInt(SECONDS_IN_YEAR);
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        dissolve_state: [{ DissolveDelaySeconds: delayInSeconds }],
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

  describe("getSnsNeuronId", () => {
    it("returns id numbers concatenated", () => {
      const id = [1, 2, 3, 4];
      const neuron: SnsNeuron = createMockSnsNeuron({
        id,
      });
      expect(getSnsNeuronId(neuron)).toBe(id.join(""));
    });
  });
});
