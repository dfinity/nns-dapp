import {
  definedNeuronsStore,
  neuronsStore,
  sortedNeuronStore,
} from "$lib/stores/neurons.store";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";

describe("neurons-store", () => {
  afterEach(() => neuronsStore.reset());

  describe("neuronsStore", () => {
    it("should set neurons", () => {
      const neurons: NeuronInfo[] = [
        { ...mockNeuron, neuronId: 1n },
        { ...mockNeuron, neuronId: 2n },
      ];
      neuronsStore.setNeurons({ neurons, certified: true });

      const neuronsInStore = get(neuronsStore);
      expect(neuronsInStore).toEqual({ neurons, certified: true });
    });

    it("should reset neurons", () => {
      const neurons: NeuronInfo[] = [
        { ...mockNeuron, neuronId: 1n },
        { ...mockNeuron, neuronId: 2n },
      ];
      neuronsStore.setNeurons({ neurons, certified: true });

      neuronsStore.reset();

      const neuronsInStore = get(neuronsStore);
      expect(neuronsInStore).toEqual({
        neurons: undefined,
        certified: undefined,
      });
    });

    it("should push neurons", () => {
      const neurons: NeuronInfo[] = [
        { ...mockNeuron, neuronId: 1n },
        { ...mockNeuron, neuronId: 2n },
      ];
      neuronsStore.setNeurons({ neurons, certified: true });

      const moreNeurons: NeuronInfo[] = [
        { ...mockNeuron, neuronId: 3n },
        { ...mockNeuron, neuronId: 4n },
      ];
      neuronsStore.pushNeurons({ neurons: moreNeurons, certified: true });

      const neuronsInStore = get(neuronsStore);
      expect(neuronsInStore).toEqual({
        neurons: [...neurons, ...moreNeurons],
        certified: true,
      });
    });

    it("should substitute duplicated neurons", () => {
      const duplicatedNeuron = { ...mockNeuron, neuronId: 2n };
      const neurons: NeuronInfo[] = [
        { ...mockNeuron, neuronId: 1n },
        duplicatedNeuron,
      ];
      neuronsStore.setNeurons({ neurons, certified: true });

      const moreNeurons: NeuronInfo[] = [
        { ...mockNeuron, neuronId: 3n },
        duplicatedNeuron,
      ];
      neuronsStore.pushNeurons({ neurons: moreNeurons, certified: true });

      const neuronsInStore = get(neuronsStore);
      expect((neuronsInStore.neurons || []).length).toEqual(3);
    });
  });

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
    it("should sort neurons by createdTimestampSeconds", () => {
      const neurons = [
        { ...mockNeuron, createdTimestampSeconds: 2n },
        { ...mockNeuron, createdTimestampSeconds: 1n },
        { ...mockNeuron, createdTimestampSeconds: 3n },
      ];
      neuronsStore.setNeurons({ neurons: [...neurons], certified: true });
      expect(get(sortedNeuronStore)).toEqual([
        neurons[2],
        neurons[0],
        neurons[1],
      ]);
    });
  });
});
