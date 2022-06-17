/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import { addController } from "../../../../lib/services/canisters.services";
import { renderModal } from "../../../mocks/modal.mock";
import AddControllerModal from "./AddControllerModalTest.svelte";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    addController: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("AddControllerModal", () => {
  const reloadMock = jest.fn();

  const renderAddControllerModal = async (): Promise<RenderResult> => {
    return renderModal({
      component: AddControllerModal,
      props: { reloadDetails: reloadMock },
    });
  };

  afterEach(() => jest.clearAllMocks());

  it("should display modal", async () => {
    const { container } = await renderAddControllerModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should call addController service and close modal", async () => {
    const principalString = "aaaaa-aa";
    const { container, queryByTestId, component } =
      await renderAddControllerModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: principalString },
      }));

    const buttonElement = queryByTestId("add-principal-button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    // SCREEN: NewControllerReview
    await waitFor(() =>
      expect(queryByTestId("new-controller-review-screen")).toBeInTheDocument()
    );

    const confirmButton = queryByTestId(
      "confirm-new-canister-controller-button"
    );
    expect(confirmButton).not.toBeNull();

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);
    confirmButton && (await fireEvent.click(confirmButton));

    expect(addController).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
