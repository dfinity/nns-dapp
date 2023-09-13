/**
 * @jest-environment jsdom
 */

import { disburseMaturity } from "$lib/api/sns-governance.api";
import SnsDisburseMaturityModal from "$lib/modals/sns/neurons/SnsDisburseMaturityModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { DisburseMaturityModalPo } from "$tests/page-objects/DisburseMaturityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";

jest.mock("$lib/api/sns-governance.api");

describe("SnsDisburseMaturityModal", () => {
  const reloadNeuron = jest.fn();

  const renderSnsDisburseMaturityModal = async (
    neuron: SnsNeuron = mockSnsNeuron
  ): Promise<DisburseMaturityModalPo> => {
    const { container } = await renderModal({
      component: SnsDisburseMaturityModal,
      props: {
        neuronId: neuron.id,
        neuron,
        rootCanisterId: mockPrincipal,
        reloadNeuron,
      },
    });
    return DisburseMaturityModalPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    authStore.setForTesting(mockIdentity);
  });

  it("should disable next button when 0 selected", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(0);
    expect(await po.isNextButtonDisabled()).toBe(true);
  });

  it("should enable next button when not 0 selected", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(1);
    expect(await po.isNextButtonDisabled()).toBe(false);
  });

  it("should display selected percentage and total maturity", async () => {
    const neuron = createMockSnsNeuron({
      id: [1],
      maturity: 1_000_000_000n,
    });
    const po = await renderSnsDisburseMaturityModal(neuron);
    await po.setPercentage(13);
    expect(await po.getAmountMaturityToDisburse()).toBe("1.30 maturity");

    await po.clickNextButton();
    expect(await po.getText()).toContain(`13%`);
  });

  it("should call disburse maturity api and reloadNeuron", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(50);
    await po.clickNextButton();

    // precondition
    expect(disburseMaturity).not.toBeCalled();
    expect(reloadNeuron).not.toBeCalled();

    await po.clickConfirmButton();

    expect(disburseMaturity).toBeCalledTimes(1);
    expect(disburseMaturity).toBeCalledWith({
      neuronId: mockSnsNeuron.id,
      rootCanisterId: mockPrincipal,
      percentageToDisburse: 50,
      identity: mockIdentity,
    });
    await waitFor(() => expect(reloadNeuron).toBeCalledTimes(1));
  });
});
