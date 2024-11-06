import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import Layout from "$routes/(app)/(nns)/settings/+layout.svelte";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Layout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderSettingsAndBack = () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Settings,
    });
    const { queryByTestId } = render(Layout);

    const { path } = get(pageStore);
    expect(path).toEqual(AppPath.Settings);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
  };

  it("should go back to the accounts page as fallback", async () => {
    referrerPathStore.set(undefined);

    renderSettingsAndBack();

    await waitFor(() => {
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Accounts);
    });
  });

  it("should go back to referrer", async () => {
    referrerPathStore.set(AppPath.Wallet);

    const spy = vi.spyOn(history, "back");

    renderSettingsAndBack();

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
