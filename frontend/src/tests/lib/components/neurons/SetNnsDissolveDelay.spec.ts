/**
 * @jest-environment jsdom
 */
import SetNnsDissolveDelay from "$lib/components/neurons/SetNnsDissolveDelay.svelte";
import { render } from "@testing-library/svelte";
import { mockNeuron } from "../../../mocks/neurons.mock";

describe("SetNnsDissolveDelay", () => {
  // Tested in CreateNeuronModal.spec.ts
  it("is not tested in isolation", () => {
    render(SetNnsDissolveDelay, {
      props: {
        neuron: mockNeuron,
        cancelButtonText: "Cancel",
        confirmButtonText: "Set Dissolve",
      },
    });
    expect(true).toBeTruthy();
  });
});
