/**
 * @jest-environment jsdom
 */
import SetNnsDissolveDelay from "$lib/components/neurons/SetNnsDissolveDelay.svelte";
import { render } from "@testing-library/svelte";
import { mockNeuron } from "../../../mocks/neurons.mock";

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
