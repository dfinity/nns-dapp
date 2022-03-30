/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SetDissolveDelay from "../../../../lib/components/neurons/SetDissolveDelay.svelte";

describe("SetDissolveDelay", () => {
  it("should render a spinner until neuron loaded", () => {
    const { container } = render(SetDissolveDelay, {props: {neuron: undefined}});

    expect(container.querySelector('[data-tid="spinner"]')).toBeInTheDocument();
  });
});
