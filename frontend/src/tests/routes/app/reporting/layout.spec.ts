import { goto } from "$app/navigation";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import Layout from "$routes/(app)/(nns)/reporting/+layout.svelte";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Layout", () => {
  vi.mock("$app/navigation", () => ({
    goto: vi.fn(() => Promise.resolve()),
  }));

  const renderReporting = () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Reporting,
    });

    return render(Layout);
  };

  beforeEach(() => {
    overrideFeatureFlagsStore.setFlag("ENABLE_EXPORT_NEURONS_REPORT", true);
  });

  it("should redirect to /accounts if feature flag is off", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_EXPORT_NEURONS_REPORT", false);

    renderReporting();

    expect(goto).toHaveBeenCalledWith(AppPath.Accounts);
    expect(goto).toHaveBeenCalledTimes(1);
  });

  it("should stay in the page if feature flag is on", () => {
    renderReporting();

    expect(goto).not.toHaveBeenCalled();
  });

  it("should go back to the accounts page as fallback", async () => {
    referrerPathStore.set(undefined);

    const { queryByTestId } = renderReporting();

    const { path } = get(pageStore);

    expect(path).toEqual(AppPath.Reporting);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(goto).toHaveBeenCalledWith(AppPath.Accounts);
    expect(goto).toHaveBeenCalledTimes(1);
  });

  it("should go back to referrer", async () => {
    referrerPathStore.set(AppPath.Wallet);

    const spy = vi.spyOn(history, "back");

    const { queryByTestId } = renderReporting();

    const { path } = get(pageStore);

    expect(path).toEqual(AppPath.Reporting);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
