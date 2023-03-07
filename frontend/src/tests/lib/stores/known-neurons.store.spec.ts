import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { mockKnownNeuron } from "$tests/mocks/neurons.mock";
import { get } from "svelte/store";

describe("knownNeurons", () => {
  const mockKnownNeurons = [mockKnownNeuron];
  it("should set known neurons", () => {
    knownNeuronsStore.setNeurons(mockKnownNeurons);

    const neurons = get(knownNeuronsStore);
    expect(neurons).toEqual(mockKnownNeurons);
  });

  it("should reset known neurons", () => {
    knownNeuronsStore.setNeurons(mockKnownNeurons);
    knownNeuronsStore.setNeurons([]);

    const neurons = get(knownNeuronsStore);
    expect(neurons).toEqual([]);
  });
});
