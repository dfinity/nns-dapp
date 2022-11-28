/**
 * @jest-environment jsdom
 */

import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
import { stakeMaturity } from "$lib/services/neurons.services";
import { formattedMaturity } from "$lib/utils/neuron.utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { renderModal } from "../../../mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("$lib/services/neurons.services", () => {
  return {
    stakeMaturity: jest.fn().mockResolvedValue(BigInt(10)),
    getNeuronFromStore: jest.fn(),
  };
});

describe("StakeMaturityModal", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      maturityE8sEquivalent: BigInt(1_000_000),
    },
  };
  const renderStakeMaturityModal = async (): Promise<
    RenderResult<SvelteComponent>
  > => {
    return renderModal({
      component: StakeMaturityModal,
      props: {
        neuron,
      },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderStakeMaturityModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display current maturity", async () => {
    const { queryByText } = await renderStakeMaturityModal();

    expect(queryByText(formattedMaturity(neuron))).toBeInTheDocument();
  });

  const selectPercentage = async (
    renderResult: RenderResult<SvelteComponent>
  ) => {
    const { queryByTestId } = renderResult;
    const rangeElement = queryByTestId("input-range");
    expect(rangeElement).toBeInTheDocument();
    rangeElement &&
      (await fireEvent.input(rangeElement, { target: { value: 50 } }));

    const selectMaturityButton = queryByTestId(
      "select-maturity-percentage-button"
    );
    expect(selectMaturityButton).toBeInTheDocument();
    selectMaturityButton && (await fireEvent.click(selectMaturityButton));
  };

  it("should call stakeMaturity service on confirm click", async () => {
    const renderResult: RenderResult<SvelteComponent> =
      await renderStakeMaturityModal();

    await selectPercentage(renderResult);

    const { queryByTestId } = renderResult;

    await waitFor(() =>
      expect(queryByTestId("confirm-action-button")).toBeInTheDocument()
    );

    const confirmButton = queryByTestId("confirm-action-button");
    expect(confirmButton).toBeInTheDocument();
    confirmButton && (await fireEvent.click(confirmButton));

    expect(stakeMaturity).toBeCalled();
  });

  it("should go back in modal on cancel click", async () => {
    const renderResult: RenderResult<SvelteComponent> =
      await renderStakeMaturityModal();

    await selectPercentage(renderResult);

    const { queryByTestId } = renderResult;

    await waitFor(() =>
      expect(queryByTestId("cancel-action-button")).toBeInTheDocument()
    );

    const cancelButton = queryByTestId("cancel-action-button");
    expect(cancelButton).toBeInTheDocument();
    cancelButton && (await fireEvent.click(cancelButton));

    expect(queryByTestId("input-range")).not.toBeNull();
  });
});
