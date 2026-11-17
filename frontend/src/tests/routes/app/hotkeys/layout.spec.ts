import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import Layout from "$routes/(app)/(nns)/hotkeys/+layout.svelte";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Layout", () => {
  const renderHotkeysAndBack = () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Hotkeys,
    });
    const { queryByTestId } = render(Layout, {
      props: {
        children: createMockSnippet(),
      },
    });

    const { path } = get(pageStore);
    expect(path).toEqual(AppPath.Hotkeys);

    const backButton = queryByTestId("back");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
  };

  it("should go back to the staking page as fallback", async () => {
    renderHotkeysAndBack();

    await waitFor(() => {
      const { path } = get(pageStore);
      expect(path).toEqual(AppPath.Staking);
    });
  });

  it("should go back to referrer", async () => {
    referrerPathStore.pushPath(AppPath.Wallet);
    const spy = vi.spyOn(history, "back");

    renderHotkeysAndBack();

    await waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
