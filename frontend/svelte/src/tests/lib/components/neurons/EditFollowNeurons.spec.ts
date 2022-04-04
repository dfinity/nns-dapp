/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/svelte";
import EditFollowNeurons from "../../../../lib/components/neurons/EditFollowNeurons.svelte";
import { mockNeuron } from "../../../mocks/neurons.mock";

describe("EditFollowNeurons", () => {
  // Tested in FollowNeuronsModal.spec.ts
  it("is not tested in isolation", () => {
    render(EditFollowNeurons, {
      props: { neuron: mockNeuron },
    });
    expect(true).toBeTruthy();
  });
});
