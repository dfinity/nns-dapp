import type { NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { neuronMock } from "../../mocks/neurons.mock";

describe("neurons-store", () => {
  it("should set proposals", () => {
    const neurons: NeuronInfo[] = [
      { ...neuronMock, neuronId: BigInt(1) },
      { ...neuronMock, neuronId: BigInt(2) },
    ];
    neuronsStore.setNeurons(neurons);

    const neuronsInStore = get(neuronsStore);
    expect(neuronsInStore).toEqual(neurons);
  });

  it("should push proposals", () => {
    const neurons: NeuronInfo[] = [
      { ...neuronMock, neuronId: BigInt(1) },
      { ...neuronMock, neuronId: BigInt(2) },
    ];
    neuronsStore.setNeurons(neurons);

    const moreNeurons: NeuronInfo[] = [
      { ...neuronMock, neuronId: BigInt(3) },
      { ...neuronMock, neuronId: BigInt(4) },
    ];
    neuronsStore.pushNeurons(moreNeurons);

    const neuronsInStore = get(neuronsStore);
    expect(neuronsInStore).toEqual([...neurons, ...moreNeurons]);
  });
});
