import SnsStakeMaturityModal from "$lib/modals/sns/neurons/SnsStakeMaturityModal.svelte";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { stakeMaturity } from "$lib/services/sns-neurons.services";
import { formattedMaturity } from "$lib/utils/sns-neuron.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { selectPercentage } from "$tests/utils/neurons-modal.test-utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

describe("SnsStakeMaturityModal", () => {
  const reloadNeuron = vi.fn();

  beforeEach(() => {
    vi.spyOn(snsNeuronsServices, "stakeMaturity").mockResolvedValue({
      success: true,
    });
  });

  const renderSnsStakeMaturityModal = async (): Promise<
    RenderResult<SvelteComponent>
  > => {
    return renderModal({
      component: SnsStakeMaturityModal,
      props: {
        neuron: mockSnsNeuron,
        neuronId: mockSnsNeuron.id,
        rootCanisterId: mockPrincipal,
        reloadNeuron,
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
