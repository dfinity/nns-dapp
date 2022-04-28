/**
 * @jest-environment jsdom
 */

import { fireEvent, type RenderResult } from "@testing-library/svelte";
import MergeMaturityModal from "../../../../lib/modals/neurons/MergeMaturityModal.svelte";
import { mergeMaturity } from "../../../../lib/services/neurons.services";
import { formatPercentage } from "../../../../lib/utils/format.utils";
import { maturityByStake } from "../../../../lib/utils/neuron.utils";
import { renderModal } from "../../../mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    mergeMaturity: jest.fn().mockResolvedValue(BigInt(10)),
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

    expect(
      queryByText(formatPercentage(maturityByStake(neuron)))
    ).toBeInTheDocument();
  });

  it("should call mergeMaturity service on confirm click", async () => {
    const { queryByTestId } = await renderMergeMaturityModal();

    const button = queryByTestId("merge-maturity-button");
    expect(button).toBeInTheDocument();

    button && (await fireEvent.click(button));
    expect(mergeMaturity).toBeCalled();
  });
});
