/**
 * @jest-environment jsdom
 */

import { removeController } from "$lib/services/canisters.services";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { clickByTestId } from "../../../utils/utils.test-utils";
import RemoveCanisterControllerButton from "./RemoveCanisterControllerButtonTest.svelte";
import {mockCanisterDetailsStore} from "../../../mocks/canisters.mock";

jest.mock("$lib/services/canisters.services", () => {
  return {
    removeController: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("RemoveCanisterControllerButton", () => {
  const controller = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  const reloadDetailsMock = jest.fn();
  const props = { controller, reloadDetails: reloadDetailsMock };

  afterEach(() => jest.clearAllMocks());

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



  it("clear selected controller after remove",  async () => {
    let selectedController = "value";
    const spy = (c) => selectedController = c;

    const { queryByTestId } = render(RemoveCanisterControllerButton, {
      props: {
        ...props,
        spy
      },
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

    expect(selectedController).toBeUndefined();
  });
});
