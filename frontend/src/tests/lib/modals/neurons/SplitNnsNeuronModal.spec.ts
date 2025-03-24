import SplitNeuronModal from "$lib/modals/neurons/SplitNnsNeuronModal.svelte";
import * as neuronsServices from "$lib/services/neurons.services";
import { splitNeuron } from "$lib/services/neurons.services";
import * as busyServices from "$lib/stores/busy.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import type { RenderResult } from "@testing-library/svelte";
import type { Component } from "svelte";

describe("SplitNeuronModal", () => {
  let startBusySpy;
  const renderSplitNeuronModal = async (
    neuron: NeuronInfo
  ): Promise<RenderResult<Component>> => {
    return renderModal({
      component: SplitNeuronModal,
      props: { neuron },
    });
  };

  beforeEach(() => {
    vi.spyOn(neuronsServices, "splitNeuron").mockResolvedValue(undefined);
    startBusySpy = vi.spyOn(busyServices, "startBusy");
  });

  it("should display modal", async () => {
    const { container } = await renderSplitNeuronModal(mockNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should have the split button button disabled by default", async () => {
    const { queryByTestId } = await renderSplitNeuronModal(mockNeuron);

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have disabled button if value is 0", async () => {
    const { queryByTestId } = await renderSplitNeuronModal(mockNeuron);

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 0 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should start busy screen with message if controlled by HW", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const hwControlledNeuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
      },
    };
    const { queryByTestId } = await renderSplitNeuronModal(hwControlledNeuron);

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 2.2 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton).not.toBeNull();
    expect(splitButton?.getAttribute("disabled")).toBeNull();

    splitButton && (await fireEvent.click(splitButton));

    expect(startBusySpy).toHaveBeenCalledTimes(1);
    expect(startBusySpy).toHaveBeenCalledWith({
      initiator: "split-neuron",
      labelKey: "busy_screen.pending_approval_hw",
    });
  });

  it("should call split neuron service if amount is valid", async () => {
    const { queryByTestId } = await renderSplitNeuronModal(mockNeuron);

    const inputElement = queryByTestId("input-ui-element");
    expect(inputElement).not.toBeNull();

    inputElement &&
      (await fireEvent.input(inputElement, { target: { value: 2.2 } }));

    const splitButton = queryByTestId("split-neuron-button");
    expect(splitButton).not.toBeNull();
    expect(splitButton?.getAttribute("disabled")).toBeNull();

    splitButton && (await fireEvent.click(splitButton));

    expect(splitNeuron).toHaveBeenCalled();
    expect(startBusySpy).toHaveBeenCalledTimes(1);
    expect(startBusySpy).toHaveBeenCalledWith({
      initiator: "split-neuron",
    });
  });
});
