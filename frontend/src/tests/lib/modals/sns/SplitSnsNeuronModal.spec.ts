import SplitSnsNeuronModal from "$lib/modals/sns/neurons/SplitSnsNeuronModal.svelte";
import { splitNeuron } from "$lib/services/sns-neurons.services";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { fireEvent } from "@testing-library/svelte";
import { vi } from "vitest";

vi.mock("$lib/services/sns-neurons.services", () => {
  return {
    splitNeuron: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("SplitSnsNeuronModal", () => {
  const token = { name: "SNS", symbol: "SNS" };
  const reloadNeuronSpy = vi.fn().mockResolvedValue(undefined);
  const renderSplitNeuronModal = () =>
    renderModal({
      component: SplitSnsNeuronModal,
      props: {
        rootCanisterId: mockPrincipal,
        neuron: { ...mockSnsNeuron },
        token,
        parameters: snsNervousSystemParametersMock,
        transactionFee: 0n,
        reloadNeuron: reloadNeuronSpy,
      },
    });

  afterAll(vi.clearAllMocks);

  it("should display modal", async () => {
    const { container } = await renderSplitNeuronModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the split button button disabled by default", async () => {
    const { queryByTestId } = await renderSplitNeuronModal();

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have disabled button if value is 0", async () => {
    const { queryByTestId } = await renderSplitNeuronModal();

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 0 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should call split neuron service if amount is valid", async () => {
    const { queryByTestId } = await renderSplitNeuronModal();

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 2.2 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton).not.toBeNull();
    expect(splitButton?.getAttribute("disabled")).toBeNull();

    splitButton && (await fireEvent.click(splitButton));

    expect(splitNeuron).toHaveBeenCalled();
    expect(reloadNeuronSpy).toHaveBeenCalled();
  });
});
