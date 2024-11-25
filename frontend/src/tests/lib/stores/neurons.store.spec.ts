import { neuronsStore } from "$lib/stores/neurons.store";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";

describe("neurons-store", () => {
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
});
