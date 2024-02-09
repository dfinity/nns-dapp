import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import AccountsLayout from "$routes/(app)/(home)/+layout.svelte";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Home layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
    tokensStore.reset();
    page.mock({
      routeId: "/",
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
    });
  });

  describe("when tokens flag is enabled", () => {
    it("should set title and header layout to 'My Tokens'", () => {
      render(AccountsLayout);

      expect(get(layoutTitleStore)).toEqual({
        title: "My Tokens",
        header: "My Tokens",
      });
    });

    it("should not show the split content navigation", () => {
      const { queryByTestId } = render(AccountsLayout);

      expect(
        queryByTestId("select-universe-nav-title")
      ).not.toBeInTheDocument();
    });

    it("should render menu toggle button", () => {
      const { queryByTestId } = render(AccountsLayout);

      expect(queryByTestId("menu-toggle")).toBeInTheDocument();
    });
  });
});
