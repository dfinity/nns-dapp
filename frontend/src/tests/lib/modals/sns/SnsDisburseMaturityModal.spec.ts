/**
 * @jest-environment jsdom
 */

import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import SnsDisburseMaturityModal from "$lib/modals/sns/neurons/SnsDisburseMaturityModal.svelte";
import { disburseMaturity } from "$lib/services/sns-neurons.services";
import { authStore } from "$lib/stores/auth.store";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsAccountsStoreSubscribe } from "$tests/mocks/sns-accounts.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { DisburseMaturityModalPo } from "$tests/page-objects/DisburseMaturityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { Principal } from "@dfinity/principal";
import type { Subscriber } from "svelte/store";

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    increaseStakeNeuron: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("$lib/stores/busy.store", () => {
  return {
    startBusy: jest.fn(),
    stopBusy: jest.fn(),
  };
});

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    disburseMaturity: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest
  .spyOn(selectedUniverseIdStore, "subscribe")
  .mockImplementation((run: Subscriber<Principal>): (() => void) => {
    run(mockPrincipal);
    return () => undefined;
  });

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
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    jest
      .spyOn(snsAccountsStore, "subscribe")
      .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

    jest
      .spyOn(snsProjectSelectedStore, "subscribe")
      .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

    jest
      .spyOn(snsSelectedTransactionFeeStore, "subscribe")
      .mockImplementation(mockSnsSelectedTransactionFeeStoreSubscribe());
  });

  it("should display destination address", async () => {
    const po = await renderSnsDisburseMaturityModal();
    const destinationAddress = shortenWithMiddleEllipsis(
      mockPrincipal.toText()
    );

    expect(await po.getText()).toContain(destinationAddress);
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
    });
    expect(reloadNeuron).toBeCalledTimes(1);
    expect(stopBusy).toBeCalledTimes(1);
  });
});
