import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import AccountsLayout from "$routes/(app)/(u)/(accounts)/+layout.svelte";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Accounts layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
    tokensStore.reset();
    page.mock({
      routeId: AppPath.Accounts,
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
    });
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

    it("back button should navigate to tokens page", async () => {
      page.mock({
        routeId: AppPath.Accounts,
      });
      const { queryByTestId } = render(AccountsLayout);

      expect(get(pageStore).path).toEqual(AppPath.Accounts);
      await fireEvent.click(queryByTestId("back"));

      expect(get(pageStore).path).toEqual(AppPath.Tokens);
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
