import EditFollowNeurons from "$lib/components/neurons/EditFollowNeurons.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

vi.mock("$lib/services/known-neurons.services", () => {
  return {
    listKnownNeurons: vi.fn(),
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
