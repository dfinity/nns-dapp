/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/svelte";
import SetDissolveDelay from "../../../../lib/components/neurons/SetDissolveDelay.svelte";
import { mockNeuron } from "../../../mocks/neurons.mock";

describe("SetDissolveDelay", () => {
  // Tested in CreateNeuronModal.spec.ts
  it("is not tested in isolation", () => {
    render(SetDissolveDelay, {
      props: {
        neuron: mockNeuron,
        cancelButtonText: "Cancel",
        confirmButtonText: "Set Dissolve",
      },
    });
    expect(true).toBeTruthy();
  });
});
