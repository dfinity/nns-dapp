import SpawnNeuronModal from "$lib/modals/neurons/SpawnNeuronModal.svelte";
import { spawnNeuron } from "$lib/services/neurons.services";
import { formattedMaturity } from "$lib/utils/neuron.utils";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { fireEvent } from "@testing-library/svelte";

vi.mock("$lib/services/neurons.services", () => {
  return {
    spawnNeuron: vi.fn().mockResolvedValue(10n),
    getNeuronFromStore: vi.fn(),
  };
});

describe("SpawnNeuronModal", () => {
  const neuron = {
    ...mockNeuron,
    fullNeuron: {
      ...mockFullNeuron,
      maturityE8sEquivalent: 10_000_000n,
    },
  };

  beforeAll(() =>
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [mockHardwareWalletAccount],
    })
  );

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should display modal", async () => {
    const { container } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron,
      },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display current maturity", async () => {
    const { queryByText } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron,
      },
    });

    expect(queryByText(formattedMaturity(neuron))).toBeInTheDocument();
  });

  it("should have disabled button if percentage is not enought to spawn a new neuron", async () => {
    const { queryByTestId } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron: {
          ...neuron,
          fullNeuron: {
            ...neuron.fullNeuron,
            maturityE8sEquivalent: 1_000_000n,
          },
        },
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
    const neuronHW = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: mockHardwareWalletAccount.principal?.toText() as string,
      },
    };

    const { queryByTestId } = await renderModal({
      component: SpawnNeuronModal,
      props: {
        neuron: neuronHW,
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
