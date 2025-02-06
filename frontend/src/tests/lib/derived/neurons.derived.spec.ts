import { SECONDS_IN_DAY, SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import {
  definedNeuronsStore,
  neuronAccountsStore,
  soonLosingRewardNeuronsStore,
  sortedNeuronStore,
} from "$lib/derived/neurons.derived";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";

describe("neurons-derived", () => {
  describe("definedNeuronsStore", () => {
    it("should return empty array when no neurons", () => {
      neuronsStore.reset();
      const definedData = get(definedNeuronsStore);
      const storedData = get(neuronsStore);
      expect(definedData).toEqual([]);
      expect(storedData.neurons).toBeUndefined();
    });

    it("should filter out neurons with no stake and no maturity", () => {
      const neurons: NeuronInfo[] = [
        {
          ...mockNeuron,
          neuronId: 1n,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            cachedNeuronStake: 0n,
            maturityE8sEquivalent: 0n,
          },
        },
        { ...mockNeuron, neuronId: 2n },
      ];
      neuronsStore.setNeurons({ neurons, certified: true });

      const definedData = get(definedNeuronsStore);
      const storedData = get(neuronsStore);
      expect(definedData.length).toBe(1);
      expect(storedData.neurons?.length).toBe(2);
    });
  });

  describe("sortedNeuronStore", () => {
    it("should sort neurons by stake", () => {
      const neurons = [
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            cachedNeuronStake: 3_000_000_000n,
          },
        },
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            cachedNeuronStake: 4_000_000_000n,
          },
        },
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            cachedNeuronStake: 1_000_000_000n,
          },
        },
      ];
      neuronsStore.setNeurons({ neurons: [...neurons], certified: true });
      expect(get(sortedNeuronStore)).toEqual([
        neurons[1],
        neurons[0],
        neurons[2],
      ]);
    });
  });

  describe("neuronAccountsStore", () => {
    it("should return the set of neuron accounts", () => {
      const accountIdentifier1 = "12345";
      const accountIdentifier2 = "54321";
      const accountIdentifier3 = "67890";
      const neurons = [
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            accountIdentifier: accountIdentifier1,
          },
        },
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            accountIdentifier: accountIdentifier2,
          },
        },
        {
          ...mockNeuron,
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            accountIdentifier: accountIdentifier3,
          },
        },
      ];
      neuronsStore.setNeurons({ neurons, certified: true });
      expect(get(neuronAccountsStore)).toEqual(
        new Set([accountIdentifier1, accountIdentifier2, accountIdentifier3])
      );
    });
  });

  describe("soonLosingRewardNeuronsStore", () => {
    const enoughDissolveDelayToVote = BigInt(SECONDS_IN_HALF_YEAR);
    const neuron1 = {
      ...mockNeuron,
      dissolveDelaySeconds: enoughDissolveDelayToVote,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(
          nowInSeconds() - SECONDS_IN_HALF_YEAR - 30 * SECONDS_IN_DAY
        ),
        cachedNeuronStake: 5_000_000_000n,
      },
    };
    const neuron2 = {
      ...mockNeuron,
      dissolveDelaySeconds: enoughDissolveDelayToVote,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        votingPowerRefreshedTimestampSeconds: 0n,
        cachedNeuronStake: 1_000_000_000n,
      },
    };
    const neuron3 = {
      ...mockNeuron,
      dissolveDelaySeconds: enoughDissolveDelayToVote,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        votingPowerRefreshedTimestampSeconds: 0n,
        cachedNeuronStake: 3_000_000_000n,
      },
    };
    const freshNeuron = {
      ...mockNeuron,
      dissolveDelaySeconds: enoughDissolveDelayToVote,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(nowInSeconds()),
      },
    };

    beforeEach(() => {
      networkEconomicsStore.setParameters({
        parameters: mockNetworkEconomics,
        certified: true,
      });
    });

    it("should return empty list when no neurons", () => {
      neuronsStore.setNeurons({
        neurons: [],
        certified: true,
      });
      expect(get(soonLosingRewardNeuronsStore)).toEqual([]);
    });

    it("should include only neurons that will soon losing its rewards", () => {
      neuronsStore.setNeurons({
        neurons: [neuron3, freshNeuron, neuron2, neuron1],
        certified: true,
      });
      expect(get(soonLosingRewardNeuronsStore)).toEqual([
        neuron3,
        neuron2,
        neuron1,
      ]);
    });

    it("should sort neurons by votingPowerRefreshedTimestampSeconds", () => {
      neuronsStore.setNeurons({
        neurons: [neuron2, neuron1, neuron3],
        certified: true,
      });
      expect(get(soonLosingRewardNeuronsStore)).toEqual([
        neuron3,
        neuron2,
        neuron1,
      ]);
    });

    it("returns [] w/o voting power economics", () => {
      networkEconomicsStore.reset();
      neuronsStore.setNeurons({
        neurons: [neuron2, neuron1, neuron3],
        certified: true,
      });
      expect(get(soonLosingRewardNeuronsStore)).toEqual([]);
    });

    it("should not include neurons that have not enough dissolve delay to vote", () => {
      const notEnoughDissolveDelayToVoteNeuron = {
        ...neuron1,
        dissolveDelaySeconds: enoughDissolveDelayToVote - 1n,
      };
      neuronsStore.setNeurons({
        neurons: [notEnoughDissolveDelayToVoteNeuron, neuron1],
        certified: true,
      });
      expect(get(soonLosingRewardNeuronsStore)).toEqual([neuron1]);
    });
  });
});
