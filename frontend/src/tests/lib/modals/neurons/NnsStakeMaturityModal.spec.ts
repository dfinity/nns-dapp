/**
 * @jest-environment jsdom
 */

import NnsStakeMaturityModal from "$lib/modals/neurons/NnsNnsStakeMaturityModal.svelte";
import { stakeMaturity } from "$lib/services/neurons.services";
import { formattedMaturity } from "$lib/utils/neuron.utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { renderModal } from "../../../mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";
import { selectPercentage } from "../../../utils/neurons-modal.test-utils";

jest.mock("$lib/services/neurons.services", () => {
  return {
    stakeMaturity: jest.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: jest.fn(),
  };
});

describe("NnsStakeMaturityModal", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      maturityE8sEquivalent: BigInt(1_000_000),
    },
  };
  const renderNnsStakeMaturityModal = async (): Promise<
    RenderResult<SvelteComponent>
  > => {
    return renderModal({
      component: NnsStakeMaturityModal,
      props: {
        neuron,
      },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderNnsStakeMaturityModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display current maturity", async () => {
    const { queryByText } = await renderNnsStakeMaturityModal();

    expect(queryByText(formattedMaturity(neuron))).toBeInTheDocument();
  });

  it("should call stakeMaturity service on confirm click", async () => {
    const renderResult: RenderResult<SvelteComponent> =
      await renderNnsStakeMaturityModal();

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
      await renderNnsStakeMaturityModal();

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
