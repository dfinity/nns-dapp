import NeuronNavigation from "$lib/components/neuron-detail/NeuronNavigation.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { neuronsStore } from "$lib/stores/neurons.store";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronNavigationPo } from "$tests/page-objects/NeuronNavigation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";
const testNeurons = [
  {
    ...mockNeuron,
    neuronId: BigInt(1),
    fullNeuron: {
      ...mockFullNeuron,
    },
  },
  {
    ...mockNeuron,
    neuronId: BigInt(2),
    fullNeuron: {
      ...mockFullNeuron,
    },
  },
  {
    ...mockNeuron,
    neuronId: BigInt(3),
    fullNeuron: {
      ...mockFullNeuron,
    },
  },
];

describe("NeuronNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    neuronsStore.reset();
    neuronsStore.setNeurons({ neurons: testNeurons, certified: true });
  });

  const renderComponent = async ({
    currentNeuronId = "1",
    currentUniverse = OWN_CANISTER_ID_TEXT,
    neuronIds = ["1", "2", "3"],
    selectNeuron = vi.fn(),
  } = {}) => {
    const { container } = render(NeuronNavigation, {
      props: {
        currentNeuronId,
        currentUniverse,
        neuronIds,
        selectNeuron,
      },
    });
    await runResolvedPromises();
    return NeuronNavigationPo.under(new JestPageObjectElement(container));
  };

  it("should render navigation buttons", async () => {
    const po = await renderComponent();

    expect(await po.isPreviousButtonHidden()).toBe(true);
    expect(await po.isNextButtonHidden()).toBe(false);
  });

  it("should disable previous button for first neuron", async () => {
    const po = await renderComponent({ currentNeuronId: "1" });

    expect(await po.isPreviousButtonHidden()).toBe(true);
    expect(await po.isNextButtonHidden()).toBe(false);
  });

  it("should disable next button for last neuron", async () => {
    const po = await renderComponent({ currentNeuronId: "3" });

    expect(await po.isPreviousButtonHidden()).toBe(false);
    expect(await po.isNextButtonHidden()).toBe(true);
  });

  it("should enable both buttons for middle neuron", async () => {
    const po = await renderComponent({ currentNeuronId: "2" });

    expect(await po.isPreviousButtonHidden()).toBe(false);
    expect(await po.isNextButtonHidden()).toBe(false);
  });

  it("should call selectNeuron with correct parameters when clicking previous", async () => {
    const selectNeuron = vi.fn();
    const po = await renderComponent({
      currentNeuronId: "2",
      selectNeuron,
    });

    await po.getPreviousButtonPo().click();

    expect(selectNeuron).toHaveBeenCalledWith("1", OWN_CANISTER_ID_TEXT);
  });

  it("should call selectNeuron with correct parameters when clicking next", async () => {
    const selectNeuron = vi.fn();
    const po = await renderComponent({
      currentNeuronId: "2",
      selectNeuron,
    });

    await po.getNextButtonPo().click();

    expect(selectNeuron).toHaveBeenCalledWith("3", OWN_CANISTER_ID_TEXT);
  });

  it("should display correct neuron IDs for navigation", async () => {
    const po = await renderComponent({ currentNeuronId: "2" });

    expect(await po.getPreviousNeuronId()).toBe("1");
    expect(await po.getNextNeuronId()).toBe("3");
  });
});
