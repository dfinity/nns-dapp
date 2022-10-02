/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/svelte";
import ConfirmDisolveDelay from "../../../../lib/components/neurons/ConfirmDissolveDelay.svelte";
import { mockNeuron } from "../../../mocks/neurons.mock";

describe("ConfirmDissolveDelay", () => {
  // Tested in CreateNeuronModal.spec.ts
  it("is not tested in isolation", () => {
    render(ConfirmDisolveDelay, {
      props: {
        neuron: mockNeuron,
        delayInSeconds: 10_000,
        confirmButtonText: "confirm",
      },
    });
    expect(true).toBeTruthy();
  });
});
