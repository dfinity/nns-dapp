import SplitSnsNeuronModal from "$lib/modals/sns/neurons/SplitSnsNeuronModal.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  createMockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { fireEvent } from "@testing-library/svelte";

vi.mock("$lib/services/sns-neurons.services", () => {
  return {
    splitNeuron: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe("SplitSnsNeuronModal", () => {
  const token = { name: "SNS", symbol: "SNS", decimals: 8 };
  const reloadNeuronSpy = vi.fn().mockResolvedValue(undefined);
  const renderSplitNeuronModal = (stake?: bigint) =>
    renderModal({
      component: SplitSnsNeuronModal,
      props: {
        rootCanisterId: mockPrincipal,
        neuron: { ...createMockSnsNeuron({ stake }) },
        token,
        parameters: snsNervousSystemParametersMock,
        transactionFee: 0n,
        reloadNeuron: reloadNeuronSpy,
      },
    });

  it("should display modal", async () => {
    const { container } = await renderSplitNeuronModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the split button button disabled by default", async () => {
    const { queryByTestId } = await renderSplitNeuronModal();

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should not display error message by default", async () => {
    const { queryByTestId } = await renderSplitNeuronModal();

    const errorMessage = queryByTestId("input-error-message");
    expect(errorMessage).toBeNull();
  });

  it("should have disabled button and display error message if value is 0", async () => {
    const { queryByTestId } = await renderSplitNeuronModal();

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 0 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();

    const errorMessage = queryByTestId("input-error-message");
    expect(errorMessage).not.toBeNull();
  });

  it("should have not disabled button and no error message if value is valid", async () => {
    const value = 10;
    const stake = 10_000_000_000n;
    const { queryByTestId } = await renderSplitNeuronModal(stake);

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).toBeNull();

    const errorMessage = queryByTestId("input-error-message");
    expect(errorMessage).toBeNull();
  });

  it("should have disabled button and error message if value is bigger than max", async () => {
    const value = 10;
    const stake = 1n;
    const { queryByTestId } = await renderSplitNeuronModal(stake);

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();

    const errorMessage = queryByTestId("input-error-message");
    expect(errorMessage).not.toBeNull();
  });

  // TODO: migrate to vitest
  // it("should call split neuron service if amount is valid", async () => {
  //   const { queryByTestId } = await renderSplitNeuronModal();
  //
  //   const inputElement = queryByTestId("input-ui-element");
  //   expect(inputElement).not.toBeNull();
  //
  //   inputElement &&
  //     (await fireEvent.input(inputElement, { target: { value: 2.2 } }));
  //
  //   const splitButton = queryByTestId("split-neuron-button");
  //   expect(splitButton).not.toBeNull();
  //   expect(splitButton?.getAttribute("disabled")).toBeNull();
  //
  //   splitButton && (await fireEvent.click(splitButton));
  //
  //   expect(splitNeuron).toHaveBeenCalled();
  //   expect(reloadNeuronSpy).toHaveBeenCalled();
  // });
});
