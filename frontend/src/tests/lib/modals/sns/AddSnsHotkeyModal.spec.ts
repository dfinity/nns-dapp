/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import AddSnsHotkeyModal from "../../../../lib/modals/sns/AddSnsHotkeyModal.svelte";
import { addHotkey } from "../../../../lib/services/sns-neurons.services";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

jest.mock("../../../../lib/services/sns-neurons.services", () => {
  return {
    addHotkey: jest.fn().mockResolvedValue(BigInt(10)),
  };
});

describe("AddSnsHotkeyModal", () => {
  const renderAddSnsHotkeyModal = async (): Promise<RenderResult> => {
    return renderModal({
      component: AddSnsHotkeyModal,
      props: { neuronId: mockSnsNeuron.id[0] },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderAddSnsHotkeyModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display error if principal is not valid on blur", async () => {
    const { container, queryByText } = await renderAddSnsHotkeyModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "not a principal" },
      }));
    inputElement && (await fireEvent.blur(inputElement));
    expect(queryByText(en.error.principal_not_valid)).toBeInTheDocument();
  });

  it("should have disabled button if principal not valid", async () => {
    const { container, queryByTestId } = await renderAddSnsHotkeyModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "not a principal" },
      }));

    const buttonElement = queryByTestId("add-principal-button");
    expect(buttonElement).not.toBeNull();
    expect(buttonElement?.hasAttribute("disabled")).toBe(true);
  });

  it("should call addHotkey service and close modal", async () => {
    const principalString = "aaaaa-aa";
    const { container, queryByTestId, component } =
      await renderAddSnsHotkeyModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: principalString },
      }));

    const buttonElement = queryByTestId("add-principal-button");
    expect(buttonElement).not.toBeNull();

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);
    buttonElement && (await fireEvent.click(buttonElement));
    expect(addHotkey).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
