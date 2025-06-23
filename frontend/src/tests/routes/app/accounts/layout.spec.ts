import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { referrerPathStore } from "$lib/stores/routes.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import AccountsLayout from "$routes/(app)/(u)/(list)/accounts/+layout.svelte";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Accounts layout", () => {
  const renderComponent = () => {
    return render(AccountsLayout, {
      props: {
        children: createMockSnippet(),
      },
    });
  };

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
    renderComponent();

    expect(get(layoutTitleStore)).toEqual({
      title: "Account",
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

    renderComponent();

    expect(get(layoutTitleStore)).toEqual({
      title: "Account",
    });
  });

  it("should not show the split content navigation", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("select-universe-nav-title")).not.toBeInTheDocument();
  });

  it("should render back button", () => {
    const { queryByTestId } = renderComponent();

    expect(queryByTestId("back")).toBeInTheDocument();
  });

  it("back button should navigate by default to tokens page", async () => {
    page.mock({
      routeId: AppPath.Accounts,
    });
    const { queryByTestId } = renderComponent();

    expect(get(pageStore).path).toEqual(AppPath.Accounts);
    await fireEvent.click(queryByTestId("back"));

    expect(get(pageStore).path).toEqual(AppPath.Tokens);
  });

  it("back button should navigate to portfolio page when coming from portfolio page", async () => {
    referrerPathStore.pushPath(AppPath.Portfolio);
    page.mock({
      routeId: AppPath.Accounts,
    });
    const { queryByTestId } = renderComponent();

    expect(get(pageStore).path).toEqual(AppPath.Accounts);
    await fireEvent.click(queryByTestId("back"));

    expect(get(pageStore).path).toEqual(AppPath.Portfolio);
  });
});
