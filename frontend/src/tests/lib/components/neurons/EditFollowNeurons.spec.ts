/**
 * @jest-environment jsdom
 */
import EditFollowNeurons from "$lib/components/neurons/EditFollowNeurons.svelte";
import { render } from "@testing-library/svelte";
import { mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: jest.fn(),
  };
});

describe("EditFollowNeurons", () => {
  // Tested in FollowNeuronsModal.spec.ts
  it("is not tested in isolation", () => {
    render(EditFollowNeurons, {
      props: { neuronId: mockNeuron.neuronId },
    });
    expect(true).toBeTruthy();
  });
});
