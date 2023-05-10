import SetNnsDissolveDelay from "$lib/components/neurons/SetNnsDissolveDelay.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { render } from "@testing-library/svelte";

describe("SetNnsDissolveDelay", () => {
  // Tested in CreateNeuronModal.spec.ts
  it("is not tested in isolation", () => {
    const { getByTestId } = render(SetNnsDissolveDelay, {
      props: {
        neuron: mockNeuron,
        delayInSeconds: 0,
      },
    });
    expect(getByTestId("set-dissolve-delay")).toBeInTheDocument();
  });
});
