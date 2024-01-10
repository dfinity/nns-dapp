import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { page } from "$mocks/$app/stores";
import Layout from "$routes/(app)/(u)/(detail)/proposal/+layout.svelte";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Layout", () => {
  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should go back to the proposal page", async () => {
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
});
