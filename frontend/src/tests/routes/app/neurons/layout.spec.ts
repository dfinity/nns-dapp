/**
 * @jest-environment jsdom
 */

import { layoutTitleStore } from "$lib/stores/layout.store";
import NeuronsLayout from "$routes/(app)/(u)/(list)/neurons/+layout.svelte";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Neurons layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to Canisters text", () => {
    render(NeuronsLayout);

    expect(get(layoutTitleStore)).toEqual({
      title: "My Neuron Staking",
      header: "My Neuron Staking",
    });
  });
});
