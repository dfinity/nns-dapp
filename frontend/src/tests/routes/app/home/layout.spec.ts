import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import AccountsLayout from "$routes/(app)/(home)/+layout.svelte";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
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

  describe("when tokens flag is disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
    });

    it("should set title and header layout to 'My ICP Tokens' when NNS Universe", () => {
      render(AccountsLayout);

      expect(get(layoutTitleStore)).toEqual({
        title: "My ICP Tokens",
        header: "My ICP Tokens",
      });
    });

    it("should set title and header layout taking into account universe token", () => {
      page.mock({
        routeId: AppPath.Accounts,
        data: { universe: rootCanisterIdMock.toText() },
      });
      tokensStore.setToken({
        canisterId: rootCanisterIdMock,
        token: {
          ...mockSnsToken,
          symbol: "TTRS",
        },
      });

      render(AccountsLayout);

      expect(get(layoutTitleStore)).toEqual({
        title: "My TTRS Tokens",
        header: "My TTRS Tokens",
      });
    });
  });

  describe("when tokens flag is enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
    });

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
