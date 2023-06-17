/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { page } from "$mocks/$app/stores";
import Layout from "$routes/(app)/(nns)/settings/+layout.svelte";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

let referrer = undefined;

jest.mock("$lib/utils/page.utils", () => ({
  ...jest.requireActual("$lib/utils/page.utils"),
  referrerPathForNav: () => referrer,
}));

describe("Layout", () => {
  beforeAll(() => jest.resetAllMocks());

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
    expect(referrer).toBeUndefined();

    renderSettingsAndBack();

    await waitFor(() => {
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Accounts);
    });
  });

  it("should go back to referrer", async () => {
    referrer = AppPath.Wallet;

    const spy = jest.spyOn(history, "back");

    renderSettingsAndBack();

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
