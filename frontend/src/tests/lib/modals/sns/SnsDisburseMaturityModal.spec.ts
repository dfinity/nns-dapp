/**
 * @jest-environment jsdom
 */

import { disburseMaturity } from "$lib/api/sns-governance.api";
import SnsDisburseMaturityModal from "$lib/modals/sns/neurons/SnsDisburseMaturityModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { DisburseMaturityModalPo } from "$tests/page-objects/DisburseMaturityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { waitFor } from "@testing-library/svelte";

jest.mock("$lib/stores/busy.store", () => {
  return {
    startBusy: jest.fn(),
    stopBusy: jest.fn(),
  };
});

jest.mock("$lib/api/sns-governance.api");

describe("SnsDisburseMaturityModal", () => {
  const reloadNeuron = jest.fn();

  const props = {
    neuronId: mockSnsNeuron.id,
    neuron: mockSnsNeuron,
    rootCanisterId: mockPrincipal,
    reloadNeuron,
  };

  const renderSnsDisburseMaturityModal =
    async (): Promise<DisburseMaturityModalPo> => {
      const { container } = await renderModal({
        component: SnsDisburseMaturityModal,
        props,
      });
      return DisburseMaturityModalPo.under(
        new JestPageObjectElement(container)
      );
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

  it("should display selected percentage", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(13);
    await po.clickNextButton();

    expect(await po.getText()).toContain(`13%`);
  });

  it("should call disburse maturity api and reloadNeuron", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(50);
    await po.clickNextButton();

    // precondition
    expect(startBusy).not.toBeCalled();
    expect(stopBusy).not.toBeCalled();
    expect(disburseMaturity).not.toBeCalled();
    expect(reloadNeuron).not.toBeCalled();

    await po.clickConfirmButton();

    expect(startBusy).toBeCalledTimes(1);
    expect(disburseMaturity).toBeCalledTimes(1);
    expect(disburseMaturity).toBeCalledWith({
      neuronId: mockSnsNeuron.id,
      rootCanisterId: mockPrincipal,
      percentageToDisburse: 50,
      identity: mockIdentity,
    });
    await waitFor(() => expect(reloadNeuron).toBeCalledTimes(1));
    expect(stopBusy).toBeCalledTimes(1);
  });
});
