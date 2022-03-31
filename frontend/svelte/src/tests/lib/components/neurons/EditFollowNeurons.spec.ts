/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import EditFollowNeurons from "../../../../lib/components/neurons/EditFollowNeurons.svelte";

describe("SetDissolveDelay", () => {
  it("should render a spinner until neuron loaded", () => {
    const { container } = render(EditFollowNeurons, {
      props: { neuron: undefined },
    });

    expect(container.querySelector('[data-tid="spinner"]')).toBeInTheDocument();
  });
});
