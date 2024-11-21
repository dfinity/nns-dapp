import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import AccountsLayout from "$routes/(app)/(u)/(list)/accounts/+layout.svelte";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Accounts layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
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
      title: "ICP Tokens",
      header: "ICP Tokens",
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
      title: "TTRS Tokens",
      header: "TTRS Tokens",
    });
  });

  describe("when tokens flag is enabled", () => {
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
});
