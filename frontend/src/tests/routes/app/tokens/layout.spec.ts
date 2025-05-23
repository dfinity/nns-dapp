import { layoutTitleStore } from "$lib/stores/layout.store";
import TokensLayout from "$routes/(app)/(nns)/tokens/+layout.svelte";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Tokens layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'Tokens'", () => {
    render(TokensLayout, {
      props: {
        children: createMockSnippet(),
      },
    });

    expect(get(layoutTitleStore)).toEqual({
      title: "Tokens",
      header: "Tokens",
    });
  });
});
