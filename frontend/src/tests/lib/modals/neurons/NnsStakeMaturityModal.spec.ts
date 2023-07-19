import NnsStakeMaturityModal from "$lib/modals/neurons/NnsStakeMaturityModal.svelte";
import { stakeMaturity } from "$lib/services/neurons.services";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { formattedMaturity } from "$lib/utils/neuron.utils";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { selectPercentage } from "$tests/utils/neurons-modal.test-utils";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { vi } from "vitest";

vi.mock("$lib/services/neurons.services", () => {
  return {
    stakeMaturity: vi.fn().mockResolvedValue({ success: true }),
    mergeMaturity: vi.fn().mockResolvedValue({ success: true }),
    getNeuronFromStore: vi.fn(),
  };
});

describe("NnsStakeMaturityModal", () => {
  const neuronIc = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      maturityE8sEquivalent: BigInt(1_000_000),
    },
  };
  const neuronHW = {
    ...neuronIc,
    fullNeuron: {
      ...neuronIc.fullNeuron,
      controller: mockHardwareWalletAccount?.principal?.toText(),
    },
  };
  const renderNnsStakeMaturityModal = async (
    neuron = neuronIc
  ): Promise<RenderResult<SvelteComponent>> => {
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

    expect(queryByText(formattedMaturity(neuronIc))).toBeInTheDocument();
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

  describe("HW", () => {
    beforeAll(() =>
      vi
        .spyOn(icpAccountsStore, "subscribe")
        .mockImplementation(
          mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
        )
    );

    it("should call stakeMaturity service on confirm click for HW", async () => {
      const renderResult: RenderResult<SvelteComponent> =
        await renderNnsStakeMaturityModal(neuronHW);

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
  });
});
