/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NewFolloweeModal from "../../../lib/modals/neurons/NewFolloweeModal.svelte";

describe("NewFolloweeModal", () => {
  it("renders an input for a neuron address", () => {
    const { container } = render(NewFolloweeModal);

    const inputElement = container.querySelector(
      '[name="new-followee-address"]'
    );

    expect(inputElement).toBeInTheDocument();
  });
});
