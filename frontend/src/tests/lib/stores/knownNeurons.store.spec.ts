import { get } from "svelte/store";
import { knownNeuronsStore } from "../../../lib/stores/knownNeurons.store";
import { mockKnownNeuron } from "../../mocks/neurons.mock";

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
