import { layoutTitleStore } from "$lib/stores/layout.store";
import PortfolioLayout from "$routes/(app)/(nns)/portfolio/+layout.svelte";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Portfolio layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'Portfolio'", () => {
    render(PortfolioLayout, {
      props: {
        children: createMockSnippet(),
      },
    });

    expect(get(layoutTitleStore)).toEqual({
      title: "Portfolio",
    });
  });
});
