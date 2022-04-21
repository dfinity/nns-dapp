/**
 * @jest-environment jsdom
 */

import { fireEvent, type RenderResult } from "@testing-library/svelte";
import AddHotkeyModal from "../../../../lib/modals/neurons/AddHotkeyModal.svelte";
import { addHotkey } from "../../../../lib/services/neurons.services";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    addHotkey: jest.fn().mockResolvedValue(BigInt(10)),
  };
});

describe("AddHotkeyModal", () => {
  const neuronId = BigInt(10);
  const renderAddHotkeyModal = async (): Promise<RenderResult> => {
    return renderModal({
      component: AddHotkeyModal,
      props: { neuronId },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderAddHotkeyModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display error if principal is not valid", async () => {
    const { container, queryByTestId, queryByText } =
      await renderAddHotkeyModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: "not a principal" },
      }));

    const buttonElement = queryByTestId("add-hotkey-neuron-button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));
    expect(queryByText(en.error.principal_not_valid)).toBeInTheDocument();
  });

  it("should call addHotkey service with valid input value", async () => {
    const principalString = "aaaaa-aa";
    const { container, queryByTestId } = await renderAddHotkeyModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: principalString },
      }));

    const buttonElement = queryByTestId("add-hotkey-neuron-button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));
    expect(addHotkey).toBeCalled();
  });
});
