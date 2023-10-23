import AddHotkeyModal from "$lib/modals/neurons/AddHotkeyModal.svelte";
import { addHotkey } from "$lib/services/neurons.services";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    addHotkey: vi.fn().mockResolvedValue(BigInt(10)),
    getNeuronFromStore: vi.fn(),
  };
});

describe("AddHotkeyModal", () => {
  const renderAddHotkeyModal = async (): Promise<
    RenderResult<SvelteComponent>
  > => {
    return renderModal({
      component: AddHotkeyModal,
      props: { neuron: mockNeuron },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderAddHotkeyModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display error if principal is not valid on blur", async () => {
    const { container, queryByText } = await renderAddHotkeyModal();

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
    const { container, queryByTestId } = await renderAddHotkeyModal();

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

  it("should call addHotkey service with valid input value", async () => {
    const principalString = "aaaaa-aa";
    const { container, queryByTestId } = await renderAddHotkeyModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: principalString },
      }));

    const buttonElement = queryByTestId("add-principal-button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));
    expect(addHotkey).toBeCalled();
  });

  it("should call addHotkey service and close modal", async () => {
    const principalString = "aaaaa-aa";
    const { container, queryByTestId, component } =
      await renderAddHotkeyModal();

    const inputElement = container.querySelector("input[type='text']");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, {
        target: { value: principalString },
      }));

    const buttonElement = queryByTestId("add-principal-button");
    expect(buttonElement).not.toBeNull();

    const onClose = vi.fn();
    component.$on("nnsClose", onClose);
    buttonElement && (await fireEvent.click(buttonElement));
    expect(addHotkey).toBeCalled();

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
