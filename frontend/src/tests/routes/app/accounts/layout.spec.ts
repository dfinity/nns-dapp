import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
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

  describe("when tokens flag is enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
    });

    it("should not show the split content navigation", () => {
      const { queryByTestId } = render(AccountsLayout);

      expect(
        queryByTestId("select-universe-nav-title")
      ).not.toBeInTheDocument();
    });

    it("should render back button", () => {
      const { queryByTestId } = render(AccountsLayout);

      expect(queryByTestId("back")).toBeInTheDocument();
    });
  });

  describe("when tokens flag is disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
    });

    it("should not show the split content navigation", () => {
      const { queryByTestId } = render(AccountsLayout);

      expect(queryByTestId("select-universe-nav-title")).toBeInTheDocument();
    });

    it("should not render back button", () => {
      const { queryByTestId } = render(AccountsLayout);

      expect(queryByTestId("back")).not.toBeInTheDocument();
    });
  });
});
