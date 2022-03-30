/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ConfirmDissolveDelay from "../../../../lib/components/neurons/ConfirmDissolveDelay.svelte";

describe("ConfirmDissolveDelay", () => {
  it("should render a spinner until neuron loaded", () => {
    const { container } = render(ConfirmDissolveDelay, {
      props: { neuron: undefined, delayInSeconds: 0 },
    });

    expect(container.querySelector('[data-tid="spinner"]')).toBeInTheDocument();
  });
});
