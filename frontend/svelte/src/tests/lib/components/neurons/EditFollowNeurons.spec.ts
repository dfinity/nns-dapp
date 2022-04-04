/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import EditFollowNeurons from "../../../../lib/components/neurons/EditFollowNeurons.svelte";

jest.mock("../../../../lib/services/knownNeurons.services", () => {
  return {
    listKnownNeurons: jest.fn(),
  };
});

describe("SetDissolveDelay", () => {
  it("should render a spinner until neuron loaded", () => {
    const { container } = render(EditFollowNeurons, {
      props: { neuron: undefined },
    });

    expect(container.querySelector('[data-tid="spinner"]')).toBeInTheDocument();
  });
});
