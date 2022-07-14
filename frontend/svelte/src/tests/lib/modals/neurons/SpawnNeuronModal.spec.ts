/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/svelte";
import SpawnNeuronModal from "../../../../lib/modals/neurons/SpawnNeuronModal.svelte";
import { spawnNeuron } from "../../../../lib/services/neurons.services";
import { formatPercentage } from "../../../../lib/utils/format.utils";
import { maturityByStake } from "../../../../lib/utils/neuron.utils";
import { renderModal } from "../../../mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    spawnNeuron: jest.fn().mockResolvedValue(BigInt(10)),
    getNeuronFromStore: jest.fn(),
  };
});

describe("SpawnNeuronModal", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      maturityE8sEquivalent: BigInt(10_000_000),
    },
  };

  afterAll(() => jest.clearAllMocks());

  it("should display modal", async () => {
    const { container } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron,
        controlledByHarwareWallet: false,
      },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display current maturity", async () => {
    const { queryByText } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron,
        controlledByHarwareWallet: false,
      },
    });

    expect(
      queryByText(
        formatPercentage(maturityByStake(neuron), {
          minFraction: 2,
          maxFraction: 2,
        })
      )
    ).toBeInTheDocument();
  });

  it("should have disabled button if percentage is not enought to spawn a new neuron", async () => {
    const { queryByTestId } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron: {
          ...neuron,
          fullNeuron: {
            ...neuron.fullNeuron,
            maturityE8sEquivalent: BigInt(1_000_000),
          },
        },
        controlledByHarwareWallet: false,
      },
    });

    const rangeElement = queryByTestId("input-range");
    expect(rangeElement).toBeInTheDocument();
    rangeElement &&
      (await fireEvent.input(rangeElement, { target: { value: 50 } }));

    const selectMaturityButton = queryByTestId(
      "select-maturity-percentage-button"
    );
    expect(selectMaturityButton).toBeInTheDocument();
    expect(selectMaturityButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should call spawnNeuron service on confirm click", async () => {
    const { queryByTestId } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron,
        controlledByHarwareWallet: false,
      },
    });

    const rangeElement = queryByTestId("input-range");
    expect(rangeElement).toBeInTheDocument();
    rangeElement &&
      (await fireEvent.input(rangeElement, { target: { value: 50 } }));

    const selectMaturityButton = queryByTestId(
      "select-maturity-percentage-button"
    );
    expect(selectMaturityButton).toBeInTheDocument();
    selectMaturityButton && (await fireEvent.click(selectMaturityButton));

    expect(spawnNeuron).toBeCalled();
  });

  it("should show only confirm screen for hardware wallet controlled neurons", async () => {
    const { queryByTestId } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron,
        controlledByHarwareWallet: true,
      },
    });

    expect(queryByTestId("confirm-spawn-hw-screen")).toBeInTheDocument();

    const rangeElement = queryByTestId("input-range");
    expect(rangeElement).not.toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-spawn-button");
    expect(confirmButton).toBeInTheDocument();
    confirmButton && (await fireEvent.click(confirmButton));

    expect(spawnNeuron).toBeCalled();
  });
});
