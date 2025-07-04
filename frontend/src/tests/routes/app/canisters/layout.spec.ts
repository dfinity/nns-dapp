import { layoutTitleStore } from "$lib/stores/layout.store";
import CanistersLayout from "$routes/(app)/(nns)/canisters/+layout.svelte";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Canisters layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'Canisters'", () => {
    render(CanistersLayout, {
      props: {
        children: createMockSnippet(),
      },
    });

    expect(get(layoutTitleStore)).toEqual({
      title: "Canisters",
    });
  });
});
