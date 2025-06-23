import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { page } from "$mocks/$app/stores";
import HomeLayout from "$routes/(app)/(home)/+layout.svelte";
import en from "$tests/mocks/i18n.mock";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Home layout", () => {
  const renderComponent = () => {
    return render(HomeLayout, {
      props: {
        children: createMockSnippet(),
      },
    });
  };

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
    renderComponent();

    expect(get(layoutTitleStore)).toEqual({
      title: en.navigation.tokens,
    });
  });

  it("should not show the split content navigation", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("select-universe-nav-title")).not.toBeInTheDocument();
  });

  it("should render menu toggle button", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("menu-toggle")).toBeInTheDocument();
  });

  describe("when ENABLE_PORTFOLIO_PAGE feature flag is one", () => {
    it("should show the Portfolio title", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_PORTFOLIO_PAGE", true);

      renderComponent();

      expect(get(layoutTitleStore)).toEqual({
        title: en.navigation.portfolio,
      });
    });
  });
});
