import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import Layout from "$routes/(app)/(u)/(detail)/proposal/+layout.svelte";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Proposal Layout", () => {
  it("should go back to the proposal page if coming from proposals page", async () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Proposal,
    });
    const { queryByTestId } = render(Layout);

    const { path } = get(pageStore);
    expect(path).toEqual(AppPath.Proposal);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    await waitFor(() => {
      const { path } = get(pageStore);
      return expect(path).toEqual(AppPath.Proposals);
    });
  });

  it("should keep the NNS universe when going back", async () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Proposal,
    });
    const { queryByTestId } = render(Layout);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    await waitFor(() => {
      const { universe } = get(pageStore);
      return expect(universe).toEqual(OWN_CANISTER_ID_TEXT);
    });
  });

  it("should keep the SNS universe when going back", async () => {
    page.mock({
      data: {
        universe: mockCanisterId.toText(),
      },
      routeId: AppPath.Proposal,
    });
    const { queryByTestId } = render(Layout);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    await waitFor(() => {
      const { universe } = get(pageStore);
      return expect(universe).toEqual(mockCanisterId.toText());
    });
  });

  it("should go back to the Launchpad page if coming from the Launchpad page", async () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Proposal,
    });
    referrerPathStore.pushPath(AppPath.Launchpad);

    const { queryByTestId } = render(Layout);

    const { path } = get(pageStore);
    expect(path).toEqual(AppPath.Proposal);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(get(pageStore).path).toEqual(AppPath.Launchpad);
  });

  it("should go back to the Portfolio page if coming from the Portfolio page", async () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Proposal,
    });
    referrerPathStore.pushPath(AppPath.Portfolio);

    const { queryByTestId } = render(Layout);

    const { path } = get(pageStore);
    expect(path).toEqual(AppPath.Proposal);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(get(pageStore).path).toEqual(AppPath.Portfolio);
  });
});
