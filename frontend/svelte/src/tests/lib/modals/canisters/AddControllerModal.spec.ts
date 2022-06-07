/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import AddControllerModal from "../../../../lib/modals/canisters/AddControllerModal.svelte";
import { mockCanisterId } from "../../../mocks/canisters.mock";
import { renderModal } from "../../../mocks/modal.mock";

describe("AddControllerModal", () => {
  const renderAddControllerModal = async (): Promise<RenderResult> => {
    return renderModal({
      component: AddControllerModal,
      props: { canisterId: mockCanisterId },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderAddControllerModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should call addController service and close modal", async () => {
    const principalString = "aaaaa-aa";
    const { container, queryByTestId } = await renderAddControllerModal();

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
    // TODO: Add controller
  });
});
