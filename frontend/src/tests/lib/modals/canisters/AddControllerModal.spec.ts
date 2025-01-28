import * as canistersServices from "$lib/services/canisters.services";
import { addController } from "$lib/services/canisters.services";
import AddControllerModal from "$tests/lib/modals/canisters/AddControllerModalTest.svelte";
import { renderModal } from "$tests/mocks/modal.mock";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

describe("AddControllerModal", () => {
  const reloadMock = vi.fn();

  const renderAddControllerModal = async (
    events?: Record<string, ($event: CustomEvent) => void>
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: AddControllerModal,
      props: { reloadDetails: reloadMock },
      events,
    });
  };

  beforeEach(() => {
    vi.spyOn(canistersServices, "addController").mockResolvedValue({
      success: true,
    });
  });

  it("should display modal", async () => {
    const { container } = await renderAddControllerModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should call addController service and close modal", async () => {
    const principalString = "aaaaa-aa";
    const onClose = vi.fn();

    const { container, queryByTestId } = await renderAddControllerModal({
      nnsClose: onClose,
    });

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

    confirmButton && (await fireEvent.click(confirmButton));

    expect(addController).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
