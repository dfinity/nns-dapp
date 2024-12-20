import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { page } from "$mocks/$app/stores";
import HomeLayout from "$routes/(app)/(home)/+layout.svelte";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Home layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
    page.mock({
      routeId: "/",
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
    });
  });

  it("should set title and header layout to 'Tokens'", () => {
    render(HomeLayout);

    expect(get(layoutTitleStore)).toEqual({
      title: en.navigation.tokens,
      header: en.navigation.tokens,
    });
  });

  it("should not show the split content navigation", () => {
    const { queryByTestId } = render(HomeLayout);

    expect(queryByTestId("select-universe-nav-title")).not.toBeInTheDocument();
  });

  it("should render menu toggle button", () => {
    const { queryByTestId } = render(HomeLayout);

    expect(queryByTestId("menu-toggle")).toBeInTheDocument();
  });

  describe("when ENABLE_PORTFOLIO_PAGE feature flag is one", () => {
    it("should show the Portfolio title", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_PORTFOLIO_PAGE", true);

      render(HomeLayout);

      expect(get(layoutTitleStore)).toEqual({
        title: en.navigation.portfolio,
        header: en.navigation.portfolio,
      });
    });
  });
});
