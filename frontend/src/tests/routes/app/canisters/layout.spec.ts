import { layoutTitleStore } from "$lib/stores/layout.store";
import CanistersLayout from "$routes/(app)/(nns)/canisters/+layout.svelte";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Canisters layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'My Canisters'", () => {
    render(CanistersLayout);

    expect(get(layoutTitleStore)).toEqual({
      title: "My Canisters",
      header: "My Canisters",
    });
  });
});
