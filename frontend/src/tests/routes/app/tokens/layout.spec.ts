import { layoutTitleStore } from "$lib/stores/layout.store";
import TokensLayout from "$routes/(app)/(nns)/tokens/+layout.svelte";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Tokens layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'My Tokens'", () => {
    render(TokensLayout);

    expect(get(layoutTitleStore)).toEqual({
      title: "My Tokens",
      header: "My Tokens",
    });
  });
});
