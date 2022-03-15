import type { NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("neurons-store", () => {
  it("should set proposals", () => {
    const neurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(1) },
      { ...mockNeuron, neuronId: BigInt(2) },
    ];
    neuronsStore.setNeurons(neurons);

    const neuronsInStore = get(neuronsStore);
    expect(neuronsInStore).toEqual(neurons);
  });

  it("should push proposals", () => {
    const neurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(1) },
      { ...mockNeuron, neuronId: BigInt(2) },
    ];
    neuronsStore.setNeurons(neurons);

    const moreNeurons: NeuronInfo[] = [
      { ...mockNeuron, neuronId: BigInt(3) },
      { ...mockNeuron, neuronId: BigInt(4) },
    ];
    neuronsStore.pushNeurons(moreNeurons);

    const neuronsInStore = get(neuronsStore);
    expect(neuronsInStore).toEqual([...neurons, ...moreNeurons]);
  });
});
