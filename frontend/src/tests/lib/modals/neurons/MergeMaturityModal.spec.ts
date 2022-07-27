/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import MergeMaturityModal from "../../../../lib/modals/neurons/MergeMaturityModal.svelte";
import { mergeMaturity } from "../../../../lib/services/neurons.services";
import { formattedMaturityByStake } from "../../../../lib/utils/neuron.utils";
import { renderModal } from "../../../mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    mergeMaturity: jest.fn().mockResolvedValue(BigInt(10)),
    getNeuronFromStore: jest.fn(),
  };
});

describe("MergeMaturityModal", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      maturityE8sEquivalent: BigInt(1_000_000),
    },
  };
  const renderMergeMaturityModal = async (): Promise<RenderResult> => {
    return renderModal({
      component: MergeMaturityModal,
      props: {
        neuron,
      },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderMergeMaturityModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display current maturity", async () => {
    const { queryByText } = await renderMergeMaturityModal();

    expect(queryByText(formattedMaturityByStake(neuron))).toBeInTheDocument();
  });

  it("should call mergeMaturity service on confirm click", async () => {
    const { queryByTestId } = await renderMergeMaturityModal();

    const rangeElement = queryByTestId("input-range");
    expect(rangeElement).toBeInTheDocument();
    rangeElement &&
      (await fireEvent.input(rangeElement, { target: { value: 50 } }));

    const selectMaturityButton = queryByTestId(
      "select-maturity-percentage-button"
    );
    expect(selectMaturityButton).toBeInTheDocument();
    selectMaturityButton && (await fireEvent.click(selectMaturityButton));

    await waitFor(() =>
      expect(queryByTestId("confirm-action-screen")).toBeInTheDocument()
    );

    const confirmButton = queryByTestId("confirm-action-button");
    expect(confirmButton).toBeInTheDocument();
    confirmButton && (await fireEvent.click(confirmButton));

    expect(mergeMaturity).toBeCalled();
  });
});
