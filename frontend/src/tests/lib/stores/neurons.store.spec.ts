import type { NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  neuronsStore,
  sortedNeuronStore,
} from "../../../lib/stores/neurons.store";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("neurons-store", () => {
  it("should set neurons", () => {
    const neurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(1) },
      { ...mockNeuron, neuronId: BigInt(2) },
    ];
    neuronsStore.setNeurons({ neurons, certified: true });

    const neuronsInStore = get(neuronsStore);
    expect(neuronsInStore).toEqual({ neurons, certified: true });
  });

  it("should push neurons", () => {
    const neurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(1) },
      { ...mockNeuron, neuronId: BigInt(2) },
    ];
    neuronsStore.setNeurons({ neurons, certified: true });

    const moreNeurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(3) },
      { ...mockNeuron, neuronId: BigInt(4) },
    ];
    neuronsStore.pushNeurons({ neurons: moreNeurons, certified: true });

    const neuronsInStore = get(neuronsStore);
    expect(neuronsInStore).toEqual({
      neurons: [...neurons, ...moreNeurons],
      certified: true,
    });
  });

  it("should substitute duplicated neurons", () => {
    const duplicatedNeuron = { ...mockNeuron, neuronId: BigInt(2) };
    const neurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(1) },
      duplicatedNeuron,
    ];
    neuronsStore.setNeurons({ neurons, certified: true });

    const moreNeurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(3) },
      duplicatedNeuron,
    ];
    neuronsStore.pushNeurons({ neurons: moreNeurons, certified: true });

    const neuronsInStore = get(neuronsStore);
    expect((neuronsInStore.neurons || []).length).toEqual(3);
  });

  describe("sortedNeuronStore", () => {
    it("should sort neurons by createdTimestampSeconds", () => {
      const neurons = [
        { ...mockNeuron, createdTimestampSeconds: BigInt(2) },
        { ...mockNeuron, createdTimestampSeconds: BigInt(1) },
        { ...mockNeuron, createdTimestampSeconds: BigInt(3) },
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
