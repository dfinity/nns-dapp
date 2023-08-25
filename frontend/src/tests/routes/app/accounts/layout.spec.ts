/**
 * @jest-environment jsdom
 */

import { layoutTitleStore } from "$lib/stores/layout.store";
import AccountsLayout from "$routes/(app)/(u)/(accounts)/+layout.svelte";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Accounts layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'My Tokens'", () => {
    render(AccountsLayout);

    expect(get(layoutTitleStore)).toEqual({
      title: "My Tokens",
      header: "My Tokens",
    });
  });
});
