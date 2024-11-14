import * as canisterServices from "$lib/services/canisters.services";
import { removeController } from "$lib/services/canisters.services";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import RemoveCanisterControllerButton from "./RemoveCanisterControllerButtonTest.svelte";

describe("RemoveCanisterControllerButton", () => {
  const controller = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  const reloadDetailsMock = vi.fn();
  const props = { controller, reloadDetails: reloadDetailsMock };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(canisterServices, "removeController").mockResolvedValue({
      success: true,
    });
  });

  it("renders a button", () => {
    const { queryByTestId } = render(RemoveCanisterControllerButton, {
      props,
    });

    expect(
      queryByTestId("remove-canister-controller-button")
    ).toBeInTheDocument();
  });

  it("opens confirmation modal on click", async () => {
    const { queryByTestId } = render(RemoveCanisterControllerButton, {
      props,
    });

    const button = queryByTestId("remove-canister-controller-button");
    expect(button).not.toBeNull();

    button && (await fireEvent.click(button));

    expect(
      queryByTestId("remove-canister-controller-confirmation-modal")
    ).toBeInTheDocument();
  });

  it("opens confirmation modal on click and closes it on cancel", async () => {
    const { queryByTestId } = render(RemoveCanisterControllerButton, {
      props,
    });

    await clickByTestId(queryByTestId, "remove-canister-controller-button");

    expect(
      queryByTestId("remove-canister-controller-confirmation-modal")
    ).toBeInTheDocument();

    await clickByTestId(queryByTestId, "confirm-no");

    await waitFor(() =>
      expect(
        queryByTestId("remove-canister-controller-confirmation-modal")
      ).not.toBeInTheDocument()
    );
  });

  it("calls removeController service on confirmation, reloads details and closes modal", async () => {
    const { queryByTestId } = render(RemoveCanisterControllerButton, {
      props,
    });

    await clickByTestId(queryByTestId, "remove-canister-controller-button");

    expect(
      queryByTestId("remove-canister-controller-confirmation-modal")
    ).toBeInTheDocument();

    await clickByTestId(queryByTestId, "confirm-yes");

    await waitFor(() =>
      expect(
        queryByTestId("remove-canister-controller-confirmation-modal")
      ).not.toBeInTheDocument()
    );
    expect(removeController).toBeCalled();
    expect(reloadDetailsMock).toBeCalled();
  });
});
