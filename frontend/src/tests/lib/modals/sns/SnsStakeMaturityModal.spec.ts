/**
 * @jest-environment jsdom
 */

import SnsStakeMaturityModal from "$lib/modals/sns/neurons/SnsStakeMaturityModal.svelte";
import { stakeMaturity } from "$lib/services/sns-neurons.services";
import { formattedMaturity } from "$lib/utils/sns-neuron.utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
import { selectPercentage } from "../../../utils/neurons-modal.test-utils";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    stakeMaturity: jest.fn().mockResolvedValue({ success: true }),
  };
});

describe("SnsStakeMaturityModal", () => {
  const reload = jest.fn();

  const renderSnsStakeMaturityModal = async (): Promise<
    RenderResult<SvelteComponent>
  > => {
    return renderModal({
      component: SnsStakeMaturityModal,
      props: {
        neuron: mockSnsNeuron,
        neuronId: mockSnsNeuron.id,
        rootCanisterId: mockPrincipal,
        reloadNeuron: async () => {
          // Do nothing here
        },
      },
    });
  };

  it("should display modal", async () => {
    const { container } = await renderSnsStakeMaturityModal();

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display current maturity", async () => {
    const { queryByText } = await renderSnsStakeMaturityModal();

    expect(queryByText(formattedMaturity(mockSnsNeuron))).toBeInTheDocument();
  });

  it("should call stakeMaturity service on confirm click", async () => {
    const renderResult: RenderResult<SvelteComponent> =
      await renderSnsStakeMaturityModal();

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
      await renderSnsStakeMaturityModal();

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
